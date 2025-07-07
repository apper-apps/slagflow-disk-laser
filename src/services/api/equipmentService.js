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

  async getMaintenanceSchedule() {
    await this.delay(300);
    const now = new Date();
    const schedules = this.equipment.map(equipment => {
      const lastMaintenance = new Date(equipment.lastMaintenance);
      const daysSinceLastMaintenance = Math.floor((now - lastMaintenance) / (1000 * 60 * 60 * 24));
      
      // Calculate next maintenance based on usage hours and equipment type
      const maintenanceInterval = this.getMaintenanceInterval(equipment.type);
      const usageHours = equipment.usageHours || 0;
      const hoursUntilMaintenance = maintenanceInterval - (usageHours % maintenanceInterval);
      
      // Estimate days until maintenance based on average daily usage
      const averageDailyUsage = equipment.avgDailyUsage || 8;
      const daysUntilMaintenance = Math.ceil(hoursUntilMaintenance / averageDailyUsage);
      
      const nextMaintenanceDate = new Date(now);
      nextMaintenanceDate.setDate(now.getDate() + daysUntilMaintenance);
      
      return {
        equipmentId: equipment.Id,
        equipmentName: equipment.name,
        equipmentType: equipment.type,
        lastMaintenance: equipment.lastMaintenance,
        nextMaintenance: nextMaintenanceDate.toISOString(),
        usageHours: usageHours,
        maintenanceInterval: maintenanceInterval,
        priority: this.getMaintenancePriority(daysSinceLastMaintenance, daysUntilMaintenance),
        estimatedDuration: this.getEstimatedDuration(equipment.type)
      };
    });
    
    return schedules;
  }

  getMaintenanceInterval(equipmentType) {
    const intervals = {
      'Crusher': 500,
      'Conveyor': 750,
      'Separator': 300,
      'Dryer': 400,
      'Cooler': 600,
      'Screener': 450
    };
    return intervals[equipmentType] || 500;
  }

  getMaintenancePriority(daysSinceLastMaintenance, daysUntilMaintenance) {
    if (daysSinceLastMaintenance > 30 || daysUntilMaintenance <= 3) return 'high';
    if (daysSinceLastMaintenance > 20 || daysUntilMaintenance <= 7) return 'medium';
    return 'low';
  }

  getEstimatedDuration(equipmentType) {
    const durations = {
      'Crusher': 4,
      'Conveyor': 2,
      'Separator': 3,
      'Dryer': 6,
      'Cooler': 4,
      'Screener': 3
    };
    return durations[equipmentType] || 3;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EquipmentService();