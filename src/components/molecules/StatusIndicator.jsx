import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const StatusIndicator = ({ 
  status, 
  label, 
  size = 'md',
  showIcon = true,
  className 
}) => {
  const statusConfig = {
    online: {
      color: 'bg-success',
      icon: 'CheckCircle',
      label: label || 'Online'
    },
    warning: {
      color: 'bg-warning',
      icon: 'AlertTriangle',
      label: label || 'Warning'
    },
    error: {
      color: 'bg-error',
      icon: 'XCircle',
      label: label || 'Error'
    },
    offline: {
      color: 'bg-gray-400',
      icon: 'Circle',
      label: label || 'Offline'
    }
  };

  const config = statusConfig[status] || statusConfig.offline;
  
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'rounded-full',
        config.color,
        sizes[size],
        status === 'warning' && 'animate-pulse'
      )} />
      {showIcon && (
        <ApperIcon 
          name={config.icon} 
          className={cn('w-4 h-4', {
            'text-success': status === 'online',
            'text-warning': status === 'warning',
            'text-error': status === 'error',
            'text-gray-400': status === 'offline'
          })} 
        />
      )}
      <span className="text-sm font-medium text-gray-700">
        {config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;