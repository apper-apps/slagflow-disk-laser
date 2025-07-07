import loadService from '@/services/api/loadService';
import invoiceService from '@/services/api/invoiceService';

class ProfitAnalyticsService {
  constructor() {
    this.profitData = [];
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.generateProfitData();
      this.initialized = true;
    }
  }

  async generateProfitData() {
    const loads = await loadService.getAll();
    const invoices = await invoiceService.getAll();
    
    this.profitData = loads.map(load => {
      const profitRecord = this.calculateLoadProfit(load);
      return {
        Id: load.Id,
        ...profitRecord,
        date: load.arrivalTime
      };
    });
  }

  calculateLoadProfit(load) {
    // Processing stage costs per tonne
    const processingStages = {
      crushing: { costPerTonne: 15.0, description: 'Primary crushing and breaking' },
      screening: { costPerTonne: 12.0, description: 'Size classification and sorting' },
      washing: { costPerTonne: 8.0, description: 'Cleaning and impurity removal' },
      secondary: { costPerTonne: 10.0, description: 'Secondary processing' }
    };

    // Operational costs per tonne
    const operationalCosts = {
      labor: 18.0,
      maintenance: 8.5,
      utilities: 12.0,
      overhead: 15.5
    };

    const totalProcessingCost = Object.values(processingStages).reduce((sum, stage) => sum + stage.costPerTonne, 0) * load.weight;
    const totalOperationalCost = Object.values(operationalCosts).reduce((sum, cost) => sum + cost, 0) * load.weight;
    const totalCost = totalProcessingCost + totalOperationalCost;

    // Revenue calculation based on chemistry
    const basePrice = this.calculatePriceFromChemistry(load.chemistry);
    const totalRevenue = basePrice * load.weight;

    // Product yield calculations
    const yields = this.calculateYields(load.chemistry, load.weight);
    
    const profit = totalRevenue - totalCost;
    const profitPerTonne = profit / load.weight;
    const profitMargin = (profit / totalRevenue) * 100;

    return {
      weight: load.weight,
      totalRevenue,
      totalCost,
      profit,
      profitPerTonne,
      profitMargin,
      processingCosts: this.calculateStageCosts(processingStages, load.weight),
      operationalCosts: this.calculateOperationalCosts(operationalCosts, load.weight),
      revenueBreakdown: this.calculateRevenueBreakdown(yields, load.chemistry),
      source: load.source,
      chemistry: load.chemistry,
      loadNumber: load.loadNumber
    };
  }

  calculatePriceFromChemistry(chemistry) {
    const basePrice = 85.0;
    const ironBonus = Math.max(0, chemistry.iron - 40) * 2.8;
    const calciumBonus = Math.max(0, chemistry.calcium - 30) * 1.5;
    const aluminumPenalty = Math.max(0, chemistry.aluminum - 5) * 3.0;
    const siliconPenalty = Math.max(0, chemistry.silicon - 16) * 2.0;
    
    return Math.max(70, basePrice + ironBonus + calciumBonus - aluminumPenalty - siliconPenalty);
  }

  calculateYields(chemistry, weight) {
    const ironRecovery = Math.min(95, 85 + (chemistry.iron - 40) * 0.5);
    const aggregateYield = Math.min(90, 80 + (chemistry.calcium / 35) * 10);
    
    return {
      primaryProduct: (ironRecovery / 100) * weight,
      aggregateProduct: (aggregateYield / 100) * weight,
      byproducts: weight * 0.05,
      waste: weight * 0.02
    };
  }

  calculateStageCosts(stages, weight) {
    const costs = {};
    for (const [stage, data] of Object.entries(stages)) {
      costs[stage] = {
        cost: data.costPerTonne * weight,
        costPerTonne: data.costPerTonne,
        description: data.description
      };
    }
    return costs;
  }

  calculateOperationalCosts(costs, weight) {
    const operational = {};
    for (const [category, costPerTonne] of Object.entries(costs)) {
      operational[category] = {
        cost: costPerTonne * weight,
        costPerTonne
      };
    }
    return operational;
  }

  calculateRevenueBreakdown(yields, chemistry) {
    const pricePerTonne = this.calculatePriceFromChemistry(chemistry);
    const byproductPrice = 35.0;
    
    return {
      primaryProduct: {
        quantity: yields.primaryProduct,
        unitPrice: pricePerTonne,
        revenue: yields.primaryProduct * pricePerTonne
      },
      aggregateProduct: {
        quantity: yields.aggregateProduct,
        unitPrice: pricePerTonne * 0.7,
        revenue: yields.aggregateProduct * pricePerTonne * 0.7
      },
      byproducts: {
        quantity: yields.byproducts,
        unitPrice: byproductPrice,
        revenue: yields.byproducts * byproductPrice
      }
    };
  }

  async getAll() {
    await this.initialize();
    await this.delay(300);
    return [...this.profitData];
  }

  async getById(id) {
    await this.initialize();
    await this.delay(200);
    const record = this.profitData.find(p => p.Id === parseInt(id));
    if (!record) {
      throw new Error('Profit record not found');
    }
    return { ...record };
  }

  async getByDateRange(startDate, endDate) {
    await this.initialize();
    await this.delay(350);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.profitData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    });
  }

  async getByStage(stage) {
    await this.initialize();
    await this.delay(250);
    
    return this.profitData.map(record => ({
      Id: record.Id,
      loadNumber: record.loadNumber,
      stageCost: record.processingCosts[stage],
      totalCost: record.totalCost,
      profitImpact: record.processingCosts[stage] ? (record.processingCosts[stage].cost / record.totalCost) * 100 : 0,
      date: record.date
    }));
  }

  async getCostBreakdown() {
    await this.initialize();
    await this.delay(300);
    
    const breakdown = {
      processing: { total: 0, stages: {} },
      operational: { total: 0, categories: {} }
    };

    this.profitData.forEach(record => {
      // Processing costs
      for (const [stage, data] of Object.entries(record.processingCosts)) {
        if (!breakdown.processing.stages[stage]) {
          breakdown.processing.stages[stage] = 0;
        }
        breakdown.processing.stages[stage] += data.cost;
        breakdown.processing.total += data.cost;
      }

      // Operational costs
      for (const [category, data] of Object.entries(record.operationalCosts)) {
        if (!breakdown.operational.categories[category]) {
          breakdown.operational.categories[category] = 0;
        }
        breakdown.operational.categories[category] += data.cost;
        breakdown.operational.total += data.cost;
      }
    });

    return breakdown;
  }

  async getRevenueBreakdown() {
    await this.initialize();
    await this.delay(300);
    
    const breakdown = {
      primaryProduct: 0,
      aggregateProduct: 0,
      byproducts: 0,
      total: 0
    };

    this.profitData.forEach(record => {
      const revenue = record.revenueBreakdown;
      breakdown.primaryProduct += revenue.primaryProduct.revenue;
      breakdown.aggregateProduct += revenue.aggregateProduct.revenue;
      breakdown.byproducts += revenue.byproducts.revenue;
    });

    breakdown.total = breakdown.primaryProduct + breakdown.aggregateProduct + breakdown.byproducts;
    return breakdown;
  }

  async getProfitTrends(period = 'daily') {
    await this.initialize();
    await this.delay(400);
    
    const trends = {};
    
    this.profitData.forEach(record => {
      const date = new Date(record.date);
      let key;
      
      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = date.toISOString().substr(0, 7);
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!trends[key]) {
        trends[key] = {
          profit: 0,
          revenue: 0,
          cost: 0,
          volume: 0,
          count: 0
        };
      }
      
      trends[key].profit += record.profit;
      trends[key].revenue += record.totalRevenue;
      trends[key].cost += record.totalCost;
      trends[key].volume += record.weight;
      trends[key].count += 1;
    });
    
    // Calculate averages
    Object.keys(trends).forEach(key => {
      const trend = trends[key];
      trend.avgProfitPerTonne = trend.profit / trend.volume;
      trend.profitMargin = (trend.profit / trend.revenue) * 100;
    });
    
    return trends;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ProfitAnalyticsService();