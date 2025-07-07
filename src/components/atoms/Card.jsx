import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Card = forwardRef(({ 
  className, 
  children,
  ...props 
}, ref) => {
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm';

  return (
    <div
      ref={ref}
      className={cn(baseStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;