import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Select = forwardRef(({ 
  className, 
  children,
  error,
  ...props 
}, ref) => {
  const baseStyles = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
  
  const errorStyles = error ? 'border-error focus:ring-error/20 focus:border-error' : '';

  return (
    <select
      ref={ref}
      className={cn(
        baseStyles,
        errorStyles,
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;