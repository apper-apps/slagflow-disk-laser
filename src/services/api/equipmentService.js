import equipmentData from '@/services/mockData/equipment.json';

class EquipmentService {
  constructor() {
    this.equipment = [...equipmentData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.equipment];
  }

  async getById(id) {
    await this.delay(200);
    const equipment = this.equipment.find(e => e.Id === parseInt(id));
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return { ...equipment };
  }

  async create(equipmentData) {
    await this.delay(500);
    const newEquipment = {
      ...equipmentData,
      Id: Math.max(...this.equipment.map(e => e.Id)) + 1,
      lastMaintenance: new Date().toISOString()
    };
    this.equipment.push(newEquipment);
    return { ...newEquipment };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.equipment.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Equipment not found');
    }
    this.equipment[index] = { ...this.equipment[index], ...updateData };
    return { ...this.equipment[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.equipment.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Equipment not found');
    }
    this.equipment.splice(index, 1);
    return true;
  }

  async getByStatus(status) {
    await this.delay(250);
    return this.equipment.filter(e => e.status === status);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EquipmentService();