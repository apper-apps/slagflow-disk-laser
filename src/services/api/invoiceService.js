import invoiceData from '@/services/mockData/invoices.json';

class InvoiceService {
  constructor() {
    this.invoices = [...invoiceData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.invoices];
  }

  async getById(id) {
    await this.delay(200);
    const invoice = this.invoices.find(i => i.Id === parseInt(id));
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return { ...invoice };
  }

  async create(invoiceData) {
    await this.delay(500);
    const newInvoice = {
      ...invoiceData,
      Id: Math.max(...this.invoices.map(i => i.Id)) + 1,
      invoiceNumber: `INV-2024-${(Math.max(...this.invoices.map(i => i.Id)) + 1).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      status: 'pending'
    };
    this.invoices.push(newInvoice);
    return { ...newInvoice };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.invoices.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    this.invoices[index] = { ...this.invoices[index], ...updateData };
    return { ...this.invoices[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.invoices.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    this.invoices.splice(index, 1);
    return true;
  }

  async getByStatus(status) {
    await this.delay(250);
    return this.invoices.filter(i => i.status === status);
  }

  async getByCustomer(customer) {
    await this.delay(250);
    return this.invoices.filter(i => i.customer.toLowerCase().includes(customer.toLowerCase()));
  }
async getRevenueData() {
    await this.delay(300);
    
    const revenueBreakdown = this.invoices.reduce((acc, invoice) => {
      invoice.items.forEach(item => {
        const category = this.categorizeProduct(item.material);
        if (!acc[category]) {
          acc[category] = { total: 0, volume: 0, items: [] };
        }
        acc[category].total += item.total;
        acc[category].volume += item.quantity;
        acc[category].items.push({
          invoiceId: invoice.Id,
          material: item.material,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          date: invoice.date
        });
      });
      return acc;
    }, {});
    
    return revenueBreakdown;
  }

  async getProfitAnalytics(startDate, endDate) {
    await this.delay(400);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const relevantInvoices = this.invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate >= start && invoiceDate <= end;
    });
    
    const analytics = {
      totalRevenue: relevantInvoices.reduce((sum, inv) => sum + inv.total, 0),
      totalInvoices: relevantInvoices.length,
      averageInvoiceValue: 0,
      revenueByCategory: {},
      monthlyTrends: this.calculateMonthlyTrends(relevantInvoices)
    };
    
    analytics.averageInvoiceValue = analytics.totalRevenue / analytics.totalInvoices || 0;
    
    // Calculate revenue by product category
    relevantInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const category = this.categorizeProduct(item.material);
        if (!analytics.revenueByCategory[category]) {
          analytics.revenueByCategory[category] = 0;
        }
        analytics.revenueByCategory[category] += item.total;
      });
    });
    
    return analytics;
  }

  categorizeProduct(material) {
    if (material.includes('Coarse')) return 'Coarse Aggregate';
    if (material.includes('Fine')) return 'Fine Aggregate';
    if (material.includes('Recycled')) return 'Recycled Products';
    return 'Other Products';
  }

  calculateMonthlyTrends(invoices) {
    const trends = {};
    invoices.forEach(invoice => {
      const month = new Date(invoice.date).toISOString().substr(0, 7);
      if (!trends[month]) {
        trends[month] = { revenue: 0, invoiceCount: 0 };
      }
      trends[month].revenue += invoice.total;
      trends[month].invoiceCount += 1;
    });
    return trends;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new InvoiceService();