import loadData from '@/services/mockData/loads.json';

class LoadService {
  constructor() {
    this.loads = [...loadData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.loads];
  }

  async getById(id) {
    await this.delay(200);
    const load = this.loads.find(l => l.Id === parseInt(id));
    if (!load) {
      throw new Error('Load not found');
    }
    return { ...load };
  }

  async create(loadData) {
    await this.delay(500);
    const newLoad = {
      ...loadData,
      Id: Math.max(...this.loads.map(l => l.Id)) + 1,
      arrivalTime: new Date().toISOString(),
      status: 'pending'
    };
    this.loads.push(newLoad);
    return { ...newLoad };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.loads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Load not found');
    }
    this.loads[index] = { ...this.loads[index], ...updateData };
    return { ...this.loads[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.loads.findIndex(l => l.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Load not found');
    }
    this.loads.splice(index, 1);
    return true;
  }

  async getByStatus(status) {
    await this.delay(250);
    return this.loads.filter(l => l.status === status);
  }
async getChemistryData(limit = 10) {
    await this.delay(300);
    const recentLoads = this.loads.slice(-limit);
    return recentLoads.map(load => ({
      Id: load.Id,
      loadNumber: load.loadNumber,
      source: load.source,
      chemistry: load.chemistry,
      status: load.status,
      arrivalTime: load.arrivalTime
    }));
  }

  async getChemistryByDateRange(startDate, endDate) {
    await this.delay(350);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.loads.filter(load => {
      const loadDate = new Date(load.arrivalTime);
      return loadDate >= start && loadDate <= end;
    }).map(load => ({
      Id: load.Id,
      loadNumber: load.loadNumber,
      source: load.source,
      chemistry: load.chemistry,
      status: load.status,
      arrivalTime: load.arrivalTime
    }));
  }

  getChemistryTolerance() {
    return {
      iron: { min: 40, max: 50, target: 45 },
      calcium: { min: 28, max: 36, target: 32 },
      silicon: { min: 12, max: 18, target: 15 },
      aluminum: { min: 3, max: 6, target: 4.5 },
      magnesium: { min: 1.5, max: 3.5, target: 2.5 }
    };
  }

  validateChemistry(chemistry) {
    const tolerance = this.getChemistryTolerance();
    const results = {};
    
    for (const [element, value] of Object.entries(chemistry)) {
      const range = tolerance[element];
      if (range) {
        const status = value >= range.min && value <= range.max ? 'within' : 
                      value < range.min ? 'low' : 'high';
        const deviation = Math.abs(value - range.target);
        results[element] = {
          value,
          status,
          deviation,
          target: range.target,
          range: range
        };
      }
    }
    
    return results;
  }
async getProfitData() {
    await this.delay(350);
    
    // Calculate basic profit metrics from load data
    const processedLoads = this.loads.filter(load => load.status === 'processed');
    
    const profitData = processedLoads.map(load => {
      // Base costs per tonne for different processing stages
      const crushingCost = 15.0; // per tonne
      const screeningCost = 12.0; // per tonne
      const washingCost = 8.0; // per tonne
      const operationalCost = 25.0; // per tonne
      
      const totalProcessingCost = (crushingCost + screeningCost + washingCost + operationalCost) * load.weight;
      
      // Revenue calculation based on material grade and chemistry
      const basePrice = this.calculateBasePriceFromChemistry(load.chemistry);
      const totalRevenue = basePrice * load.weight;
      
      const profit = totalRevenue - totalProcessingCost;
      const profitPerTonne = profit / load.weight;
      
      return {
        Id: load.Id,
        loadNumber: load.loadNumber,
        weight: load.weight,
        totalRevenue,
        totalCost: totalProcessingCost,
        profit,
        profitPerTonne,
        date: load.arrivalTime,
        source: load.source,
        chemistry: load.chemistry
      };
    });
    
    return profitData;
  }

  calculateBasePriceFromChemistry(chemistry) {
    // Calculate price based on iron content and other factors
    const ironBonus = Math.max(0, chemistry.iron - 40) * 2.5; // Bonus for high iron
    const basePrice = 85.0; // Base price per tonne
    const qualityAdjustment = ironBonus - (chemistry.aluminum > 5 ? 5 : 0); // Penalty for high aluminum
    
    return Math.max(75, basePrice + qualityAdjustment);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new LoadService();