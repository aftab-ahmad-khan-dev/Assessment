import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = null,
  warning = null,
  maxLength,
  className = '',
  ...props 
}) => {
  const inputClasses = `w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    error 
      ? 'border-red-300 bg-red-50' 
      : warning
      ? 'border-yellow-300 bg-yellow-50'
      : 'border-gray-300 hover:border-gray-400'
  } ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={inputClasses}
        {...props}
      />
      
      {warning && (
        <div className="flex items-center text-sm text-yellow-700">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {warning}
        </div>
      )}
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value?.length || 0} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default Input;