import maintenanceData from '@/services/mockData/maintenanceTasks.json';

class MaintenanceService {
  constructor() {
    this.tasks = [...maintenanceData];
    this.lastId = Math.max(...this.tasks.map(t => t.Id));
  }

  async getAll() {
    await this.delay(300);
    return [...this.tasks];
  }

  async getById(id) {
    await this.delay(200);
    const task = this.tasks.find(t => t.Id === parseInt(id));
    if (!task) {
      throw new Error('Maintenance task not found');
    }
    return { ...task };
  }

  async create(taskData) {
    await this.delay(500);
    const newTask = {
      ...taskData,
      Id: ++this.lastId,
      createdDate: new Date().toISOString(),
      completedDate: null,
      notes: taskData.notes || ''
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Maintenance task not found');
    }
    
    this.tasks[index] = { 
      ...this.tasks[index], 
      ...updateData,
      Id: parseInt(id) // Ensure Id is not overwritten
    };
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Maintenance task not found');
    }
    this.tasks.splice(index, 1);
    return true;
  }

  async getByStatus(status) {
    await this.delay(250);
    return this.tasks.filter(t => t.status === status);
  }

  async getByPriority(priority) {
    await this.delay(250);
    return this.tasks.filter(t => t.priority === priority);
  }

  async getByAssignee(personnelId) {
    await this.delay(250);
    return this.tasks.filter(t => t.assignedTo === parseInt(personnelId));
  }

  async getByEquipment(equipmentId) {
    await this.delay(250);
    return this.tasks.filter(t => t.equipmentId === parseInt(equipmentId));
  }

  async getByDateRange(startDate, endDate) {
    await this.delay(300);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.tasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= start && taskDate <= end;
    });
  }

  async completeTask(id, notes = '') {
    await this.delay(300);
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Maintenance task not found');
    }
    
    this.tasks[index] = {
      ...this.tasks[index],
      status: 'completed',
      completedDate: new Date().toISOString(),
      notes: notes || this.tasks[index].notes
    };
    
    return { ...this.tasks[index] };
  }

  async getTaskStatistics() {
    await this.delay(200);
    
    const stats = {
      total: this.tasks.length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
      inProgress: this.tasks.filter(t => t.status === 'in-progress').length,
      scheduled: this.tasks.filter(t => t.status === 'scheduled').length,
      cancelled: this.tasks.filter(t => t.status === 'cancelled').length,
      highPriority: this.tasks.filter(t => t.priority === 'high').length,
      mediumPriority: this.tasks.filter(t => t.priority === 'medium').length,
      lowPriority: this.tasks.filter(t => t.priority === 'low').length,
      overdue: this.tasks.filter(t => {
        const scheduled = new Date(t.scheduledDate);
        const now = new Date();
        return t.status !== 'completed' && scheduled < now;
      }).length
    };
    
    return stats;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new MaintenanceService();