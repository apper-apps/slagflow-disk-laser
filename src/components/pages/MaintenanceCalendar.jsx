import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import FormField from '@/components/molecules/FormField';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { cn } from '@/utils/cn';
import maintenanceService from '@/services/api/maintenanceService';
import personnelService from '@/services/api/personnelService';
import equipmentService from '@/services/api/equipmentService';

const MaintenanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [tasks, setTasks] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterPersonnel, setFilterPersonnel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    equipmentId: '',
    assignedTo: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    estimatedDuration: 2,
    priority: 'medium',
    status: 'scheduled',
    taskType: 'routine'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tasksData, personnelData, equipmentData] = await Promise.all([
        maintenanceService.getAll(),
        personnelService.getAll(),
        equipmentService.getAll()
      ]);
      
      setTasks(tasksData);
      setPersonnel(personnelData);
      setEquipment(equipmentData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setTaskForm(prev => ({
      ...prev,
      scheduledDate: format(date, 'yyyy-MM-dd')
    }));
    setShowTaskModal(true);
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      equipmentId: task.equipmentId,
      assignedTo: task.assignedTo,
      scheduledDate: format(parseISO(task.scheduledDate), 'yyyy-MM-dd'),
      scheduledTime: task.scheduledTime,
      estimatedDuration: task.estimatedDuration,
      priority: task.priority,
      status: task.status,
      taskType: task.taskType
    });
    setShowTaskModal(true);
  };

  const handleCreateTask = async () => {
    try {
      const newTask = await maintenanceService.create({
        ...taskForm,
        scheduledDate: new Date(`${taskForm.scheduledDate}T${taskForm.scheduledTime}`).toISOString()
      });
      
      setTasks(prev => [...prev, newTask]);
      setShowTaskModal(false);
      resetForm();
      toast.success('Maintenance task created successfully');
    } catch (err) {
      toast.error('Failed to create maintenance task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const updatedTask = await maintenanceService.update(editingTask.Id, {
        ...taskForm,
        scheduledDate: new Date(`${taskForm.scheduledDate}T${taskForm.scheduledTime}`).toISOString()
      });
      
      setTasks(prev => prev.map(task => 
        task.Id === editingTask.Id ? updatedTask : task
      ));
      setShowTaskModal(false);
      setEditingTask(null);
      resetForm();
      toast.success('Maintenance task updated successfully');
    } catch (err) {
      toast.error('Failed to update maintenance task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this maintenance task?')) return;
    
    try {
      await maintenanceService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Maintenance task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete maintenance task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const updatedTask = await maintenanceService.update(taskId, {
        status: 'completed',
        completedDate: new Date().toISOString()
      });
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
      toast.success('Maintenance task completed');
    } catch (err) {
      toast.error('Failed to complete maintenance task');
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      const schedule = await equipmentService.getMaintenanceSchedule();
      const newTasks = [];
      
      for (const item of schedule) {
        if (item.priority === 'high') {
          // Create high priority maintenance tasks
          const maintenancePersonnel = personnel.find(p => p.role === 'Maintenance');
          if (maintenancePersonnel) {
            const task = await maintenanceService.create({
              title: `${item.equipmentType} Maintenance - ${item.equipmentName}`,
              description: `Scheduled maintenance based on usage patterns. Equipment has ${item.usageHours} usage hours.`,
              equipmentId: item.equipmentId,
              assignedTo: maintenancePersonnel.Id,
              scheduledDate: item.nextMaintenance,
              scheduledTime: '08:00',
              estimatedDuration: item.estimatedDuration,
              priority: item.priority,
              status: 'scheduled',
              taskType: 'preventive'
            });
            newTasks.push(task);
          }
        }
      }
      
      setTasks(prev => [...prev, ...newTasks]);
      toast.success(`Generated ${newTasks.length} maintenance tasks based on equipment usage`);
    } catch (err) {
      toast.error('Failed to generate maintenance schedule');
    }
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      equipmentId: '',
      assignedTo: '',
      scheduledDate: '',
      scheduledTime: '09:00',
      estimatedDuration: 2,
      priority: 'medium',
      status: 'scheduled',
      taskType: 'routine'
    });
    setEditingTask(null);
    setSelectedDate(null);
  };

const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesPersonnel = filterPersonnel === 'all' || task.assignedTo === parseInt(filterPersonnel);
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      return matchesPersonnel && matchesStatus && matchesPriority;
    });
  };

  const getTasksForDate = (date) => {
    return getFilteredTasks().filter(task => {
      const taskDate = parseISO(task.scheduledDate);
      return isSameDay(taskDate, date);
    });
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayTasks = getTasksForDate(currentDay);
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isToday = isSameDay(currentDay, new Date());
        
        days.push(
          <div
            key={day}
            className={cn(
              'min-h-[120px] border border-gray-200 p-2 cursor-pointer transition-colors',
              isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400',
              isToday && 'bg-blue-50 border-blue-200'
            )}
            onClick={() => handleDateClick(currentDay)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                'text-sm font-medium',
                isToday && 'text-blue-600'
              )}>
                {format(currentDay, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <Badge variant="secondary" size="sm">
                  {dayTasks.length}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              {dayTasks.slice(0, 3).map(task => (
                <div
                  key={task.Id}
                  className={cn(
                    'text-xs p-1 rounded truncate cursor-pointer',
                    task.priority === 'high' && 'bg-red-100 text-red-700',
                    task.priority === 'medium' && 'bg-yellow-100 text-yellow-700',
                    task.priority === 'low' && 'bg-green-100 text-green-700'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{dayTasks.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return rows;
  };

  const renderTaskModal = () => {
    if (!showTaskModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTask ? 'Edit Maintenance Task' : 'New Maintenance Task'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTaskModal(false);
                  resetForm();
                }}
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Task Title" className="md:col-span-2">
                <Input
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </FormField>
              
              <FormField label="Description" className="md:col-span-2">
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </FormField>
              
              <FormField label="Equipment">
                <Select
                  value={taskForm.equipmentId}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, equipmentId: e.target.value }))}
                >
                  <option value="">Select equipment</option>
                  {equipment.map(item => (
                    <option key={item.Id} value={item.Id}>
                      {item.name} - {item.type}
                    </option>
                  ))}
                </Select>
              </FormField>
              
              <FormField label="Assigned To">
                <Select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                >
                  <option value="">Select personnel</option>
                  {personnel.map(person => (
                    <option key={person.Id} value={person.Id}>
                      {person.name} - {person.role}
                    </option>
                  ))}
                </Select>
              </FormField>
              
              <FormField label="Scheduled Date">
                <Input
                  type="date"
                  value={taskForm.scheduledDate}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </FormField>
              
              <FormField label="Scheduled Time">
                <Input
                  type="time"
                  value={taskForm.scheduledTime}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </FormField>
              
              <FormField label="Estimated Duration (hours)">
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={taskForm.estimatedDuration}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                />
              </FormField>
              
              <FormField label="Priority">
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormField>
              
              <FormField label="Task Type">
                <Select
                  value={taskForm.taskType}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, taskType: e.target.value }))}
                >
                  <option value="routine">Routine</option>
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                </Select>
              </FormField>
              
              <FormField label="Status">
                <Select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormField>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTaskModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              {editingTask && (
                <Button
                  variant="error"
                  onClick={() => {
                    handleDeleteTask(editingTask.Id);
                    setShowTaskModal(false);
                    resetForm();
                  }}
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                variant="primary"
                onClick={editingTask ? handleUpdateTask : handleCreateTask}
              >
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Maintenance Calendar</h1>
          <p className="text-gray-600 mt-1">Schedule and track maintenance tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleGenerateSchedule}
            size="sm"
          >
            <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
            Generate Schedule
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowTaskModal(true)}
            size="sm"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
            >
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={filterPersonnel}
              onChange={(e) => setFilterPersonnel(e.target.value)}
              className="w-40"
            >
              <option value="all">All Personnel</option>
              {personnel.map(person => (
                <option key={person.Id} value={person.Id}>
                  {person.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-32"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-32"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-0 border-b border-gray-200 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="space-y-0">
            {renderCalendarGrid()}
          </div>
        </div>
      </Card>

      {/* Task Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{getFilteredTasks().length}</p>
              </div>
              <ApperIcon name="Calendar" className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {getFilteredTasks().filter(t => t.status === 'completed').length}
                </p>
              </div>
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {getFilteredTasks().filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <ApperIcon name="Clock" className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">
                  {getFilteredTasks().filter(t => t.priority === 'high').length}
                </p>
              </div>
              <ApperIcon name="AlertTriangle" className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </Card>

      {renderTaskModal()}
    </div>
  );
};

export default MaintenanceCalendar;