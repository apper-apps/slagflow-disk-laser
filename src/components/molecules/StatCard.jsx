import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className,
  ...props 
}) => {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-gray-500'
  };

  const changeIcons = {
    positive: 'TrendingUp',
    negative: 'TrendingDown',
    neutral: 'Minus'
  };

  return (
    <Card className={cn('p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className={cn('flex items-center mt-2', changeColors[changeType])}>
              <ApperIcon name={changeIcons[changeType]} className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;