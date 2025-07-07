import { useState, useEffect } from 'react';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAlerts([
          {
            id: 1,
            type: 'warning',
            title: 'High Temperature Alert',
            message: 'Crusher #2 temperature at 95°C',
            timestamp: new Date(Date.now() - 1000 * 60 * 15),
            equipment: 'Crusher #2'
          },
          {
            id: 2,
            type: 'error',
            title: 'Equipment Failure',
            message: 'Conveyor belt motor requires immediate attention',
            timestamp: new Date(Date.now() - 1000 * 60 * 45),
            equipment: 'Conveyor #1'
          },
          {
            id: 3,
            type: 'info',
            title: 'Maintenance Scheduled',
            message: 'Routine maintenance for Screen #3 tomorrow',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            equipment: 'Screen #3'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getAlertBadge = (type) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
        <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
        <Button variant="outline" size="sm">
          <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              'flex items-start space-x-3 p-3 rounded-lg border transition-colors',
              alert.type === 'error' && 'bg-error/5 border-error/20',
              alert.type === 'warning' && 'bg-warning/5 border-warning/20 animate-pulse',
              alert.type === 'info' && 'bg-info/5 border-info/20'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              alert.type === 'error' && 'bg-error/10',
              alert.type === 'warning' && 'bg-warning/10',
              alert.type === 'info' && 'bg-info/10'
            )}>
              <ApperIcon 
                name={getAlertIcon(alert.type)} 
                className={cn(
                  'w-4 h-4',
                  alert.type === 'error' && 'text-error',
                  alert.type === 'warning' && 'text-warning',
                  alert.type === 'info' && 'text-info'
                )}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant={getAlertBadge(alert.type)} size="sm">
                    {alert.equipment}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <Button variant="ghost" className="w-full">
          View All Alerts
          <ApperIcon name="ChevronRight" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default AlertsPanel;