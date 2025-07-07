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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new InvoiceService();