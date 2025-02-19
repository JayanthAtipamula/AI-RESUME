import React from 'react';
import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
}

const toast = ({ title, description, action, variant = 'default' }: ToastOptions) => {
  return hotToast.custom(
    ({ visible }: { visible: boolean }) => (
      <div
        className={`${
          visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${variant === 'destructive' ? 'text-red-600' : 'text-gray-900'}`}>
                {title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            </div>
          </div>
        </div>
        {action && (
          <div className="flex border-l border-gray-200">
            <div className="flex items-center justify-center px-4">
              {action}
            </div>
          </div>
        )}
      </div>
    ),
    {
      position: 'top-right',
      duration: 5000,
    }
  );
};

export default toast;
