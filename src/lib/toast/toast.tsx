import { toast as hotToast } from 'react-hot-toast';
import { ReactNode } from 'react';

// Common toast style options
const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #2a2a2a',
  }
};

// Common icon theme
const successIcon = {
  iconTheme: {
    primary: '#4CAF50',
    secondary: '#fff',
  }
};

const errorIcon = {
  iconTheme: {
    primary: '#f44336',
    secondary: '#fff',
  }
};

// Simple toast implementation that avoids complex JSX
const toast = {
  success: (message: string | ReactNode) => {
    if (typeof message === 'string') {
      hotToast.success(message, {
        ...toastStyle,
        ...successIcon
      });
    } else {
      // For ReactNode messages, just convert to string to avoid JSX issues
      hotToast.success('Success', {
        ...toastStyle,
        ...successIcon
      });
    }
  },
  error: (message: string | ReactNode) => {
    if (typeof message === 'string') {
      hotToast.error(message, {
        ...toastStyle,
        ...errorIcon
      });
    } else {
      // For ReactNode messages, just convert to string to avoid JSX issues
      hotToast.error('Error occurred', {
        ...toastStyle,
        ...errorIcon
      });
    }
  }
};

export default toast;
