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

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new LoadService();