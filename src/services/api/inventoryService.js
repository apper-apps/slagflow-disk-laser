import inventoryData from '@/services/mockData/inventory.json';

class InventoryService {
  constructor() {
    this.inventory = [...inventoryData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.inventory];
  }

  async getById(id) {
    await this.delay(200);
    const item = this.inventory.find(i => i.Id === parseInt(id));
    if (!item) {
      throw new Error('Inventory item not found');
    }
    return { ...item };
  }

  async create(itemData) {
    await this.delay(500);
    const newItem = {
      ...itemData,
      Id: Math.max(...this.inventory.map(i => i.Id)) + 1,
      lastUpdated: new Date().toISOString()
    };
    this.inventory.push(newItem);
    return { ...newItem };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.inventory.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Inventory item not found');
    }
    this.inventory[index] = { ...this.inventory[index], ...updateData, lastUpdated: new Date().toISOString() };
    return { ...this.inventory[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.inventory.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Inventory item not found');
    }
    this.inventory.splice(index, 1);
    return true;
  }

  async getByMaterial(material) {
    await this.delay(250);
    return this.inventory.filter(i => i.material.toLowerCase().includes(material.toLowerCase()));
  }

  async getLowStock(threshold = 0.3) {
    await this.delay(250);
    return this.inventory.filter(i => (i.quantity / i.capacity) < threshold);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new InventoryService();