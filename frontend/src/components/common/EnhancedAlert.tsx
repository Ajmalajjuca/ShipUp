import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface EnhancedAlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  className?: string;
}

const EnhancedAlert: React.FC<EnhancedAlertProps> = ({ 
  type, 
  message, 
  onClose,
  className = ''
}) => {
  const alertStyles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400'
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  }[type];

  return (
    <div
      className={`flex items-center p-4 mb-4 rounded-lg border ${alertStyles[type]} ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 mr-2 ${iconColor[type]}`} />
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-opacity-20 ${
            type === 'error' ? 'hover:bg-red-200' : 
            type === 'success' ? 'hover:bg-green-200' : 
            type === 'warning' ? 'hover:bg-yellow-200' : 
            'hover:bg-blue-200'
          }`}
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close alert</span>
        </button>
      )}
    </div>
  );
};

export default EnhancedAlert; 