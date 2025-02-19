import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #2a2a2a',
      },
      iconTheme: {
        primary: '#4CAF50',
        secondary: '#fff',
      },
    });
  },
  error: (message: string) => {
    hotToast.error(message, {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #2a2a2a',
      },
      iconTheme: {
        primary: '#f44336',
        secondary: '#fff',
      },
    });
  },
};

export default toast;
