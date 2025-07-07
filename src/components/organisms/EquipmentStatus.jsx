import { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import StatusIndicator from '@/components/molecules/StatusIndicator';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const EquipmentStatus = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setEquipment([
          {
            id: 1,
            name: 'Crusher #1',
            type: 'Crusher',
            status: 'online',
            temperature: 78,
            maxTemp: 100,
            efficiency: 94,
            lastMaintenance: '2024-01-15'
          },
          {
            id: 2,
            name: 'Crusher #2',
            type: 'Crusher',
            status: 'warning',
            temperature: 95,
            maxTemp: 100,
            efficiency: 87,
            lastMaintenance: '2024-01-10'
          },
          {
            id: 3,
            name: 'Screen #1',
            type: 'Screen',
            status: 'online',
            temperature: 65,
            maxTemp: 80,
            efficiency: 92,
            lastMaintenance: '2024-01-20'
          },
          {
            id: 4,
            name: 'Conveyor #1',
            type: 'Conveyor',
            status: 'error',
            temperature: 45,
            maxTemp: 60,
            efficiency: 0,
            lastMaintenance: '2024-01-05'
          },
          {
            id: 5,
            name: 'Grinder #1',
            type: 'Grinder',
            status: 'online',
            temperature: 82,
            maxTemp: 110,
            efficiency: 96,
            lastMaintenance: '2024-01-18'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getTemperatureColor = (temp, maxTemp) => {
    const ratio = temp / maxTemp;
    if (ratio > 0.9) return 'text-error';
    if (ratio > 0.75) return 'text-warning';
    return 'text-success';
  };

  const getEquipmentIcon = (type) => {
    switch (type) {
      case 'Crusher': return 'Hammer';
      case 'Screen': return 'Filter';
      case 'Conveyor': return 'MoveRight';
      case 'Grinder': return 'Disc';
      default: return 'Cog';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Equipment Status</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StatusIndicator status="online" label="5 Online" />
            <StatusIndicator status="warning" label="1 Warning" />
            <StatusIndicator status="error" label="1 Error" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <div 
            key={item.id}
            className={cn(
              'p-4 border rounded-lg transition-all hover:shadow-md',
              item.status === 'error' && 'border-error/20 bg-error/5',
              item.status === 'warning' && 'border-warning/20 bg-warning/5',
              item.status === 'online' && 'border-success/20 bg-success/5',
              item.status === 'offline' && 'border-gray-200 bg-gray-50'
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ApperIcon 
                  name={getEquipmentIcon(item.type)} 
                  className="w-5 h-5 text-gray-600" 
                />
                <h4 className="font-medium text-gray-900">{item.name}</h4>
              </div>
              <StatusIndicator status={item.status} showIcon={false} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className={cn(
                  'text-sm font-medium',
                  getTemperatureColor(item.temperature, item.maxTemp)
                )}>
                  {item.temperature}°C
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency</span>
                <span className="text-sm font-medium text-gray-900">{item.efficiency}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Maintenance</span>
                <span className="text-sm text-gray-500">{item.lastMaintenance}</span>
              </div>
            </div>

            {/* Temperature Gauge */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all',
                    getTemperatureColor(item.temperature, item.maxTemp).replace('text-', 'bg-')
                  )}
                  style={{ width: `${(item.temperature / item.maxTemp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EquipmentStatus;