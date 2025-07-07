import { cn } from '@/utils/cn';

const FormField = ({ 
  label, 
  children, 
  error, 
  required, 
  className,
  ...props 
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;