import personnelData from '@/services/mockData/personnel.json';

class PersonnelService {
  constructor() {
    this.personnel = [...personnelData];
    this.lastId = Math.max(...this.personnel.map(p => p.Id));
  }

  async getAll() {
    await this.delay(300);
    return [...this.personnel];
  }

  async getById(id) {
    await this.delay(200);
    const person = this.personnel.find(p => p.Id === parseInt(id));
    if (!person) {
      throw new Error('Personnel not found');
    }
    return { ...person };
  }

  async create(personnelData) {
    await this.delay(500);
    const newPerson = {
      ...personnelData,
      Id: ++this.lastId,
      currentTasks: 0,
      availability: 'available',
      startDate: new Date().toISOString().split('T')[0]
    };
    this.personnel.push(newPerson);
    return { ...newPerson };
  }

  async update(id, updateData) {
    await this.delay(400);
    const index = this.personnel.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Personnel not found');
    }
    
    this.personnel[index] = { 
      ...this.personnel[index], 
      ...updateData,
      Id: parseInt(id) // Ensure Id is not overwritten
    };
    return { ...this.personnel[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.personnel.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Personnel not found');
    }
    this.personnel.splice(index, 1);
    return true;
  }

  async getByRole(role) {
    await this.delay(250);
    return this.personnel.filter(p => p.role === role);
  }

  async getByDepartment(department) {
    await this.delay(250);
    return this.personnel.filter(p => p.department === department);
  }

  async getByShift(shift) {
    await this.delay(250);
    return this.personnel.filter(p => p.shift === shift);
  }

  async getByAvailability(availability) {
    await this.delay(250);
    return this.personnel.filter(p => p.availability === availability);
  }

  async getAvailablePersonnel() {
    await this.delay(250);
    return this.personnel.filter(p => 
      p.availability === 'available' && p.currentTasks < p.maxTasks
    );
  }

  async getPersonnelBySkill(skill) {
    await this.delay(250);
    return this.personnel.filter(p => 
      p.skills.includes(skill)
    );
  }

  async assignTask(personnelId, taskId) {
    await this.delay(300);
    const index = this.personnel.findIndex(p => p.Id === parseInt(personnelId));
    if (index === -1) {
      throw new Error('Personnel not found');
    }
    
    const person = this.personnel[index];
    if (person.currentTasks >= person.maxTasks) {
      throw new Error('Personnel is at maximum task capacity');
    }
    
    this.personnel[index] = {
      ...person,
      currentTasks: person.currentTasks + 1,
      availability: person.currentTasks + 1 >= person.maxTasks ? 'busy' : 'available'
    };
    
    return { ...this.personnel[index] };
  }

  async unassignTask(personnelId, taskId) {
    await this.delay(300);
    const index = this.personnel.findIndex(p => p.Id === parseInt(personnelId));
    if (index === -1) {
      throw new Error('Personnel not found');
    }
    
    const person = this.personnel[index];
    if (person.currentTasks <= 0) {
      throw new Error('Personnel has no tasks to unassign');
    }
    
    this.personnel[index] = {
      ...person,
      currentTasks: Math.max(0, person.currentTasks - 1),
      availability: 'available'
    };
    
    return { ...this.personnel[index] };
  }

  async getWorkloadStatistics() {
    await this.delay(200);
    
    const stats = {
      total: this.personnel.length,
      available: this.personnel.filter(p => p.availability === 'available').length,
      busy: this.personnel.filter(p => p.availability === 'busy').length,
      byRole: {},
      byDepartment: {},
      byShift: {},
      averageExperience: 0,
      totalTasks: this.personnel.reduce((sum, p) => sum + p.currentTasks, 0),
      maxCapacity: this.personnel.reduce((sum, p) => sum + p.maxTasks, 0)
    };
    
    // Calculate role distribution
    this.personnel.forEach(person => {
      stats.byRole[person.role] = (stats.byRole[person.role] || 0) + 1;
      stats.byDepartment[person.department] = (stats.byDepartment[person.department] || 0) + 1;
      stats.byShift[person.shift] = (stats.byShift[person.shift] || 0) + 1;
    });
    
    // Calculate average experience
    stats.averageExperience = this.personnel.reduce((sum, p) => sum + p.experience, 0) / this.personnel.length;
    
    return stats;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PersonnelService();