import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from '../lib/toast';
import { useAuthStore } from '../lib/store';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'stripe'>('cashfree');

  if (!isOpen) return null;

  const handlePaymentMethodChange = (method: 'cashfree' | 'stripe') => {
    setPaymentMethod(method);
  };

  const handleContinue = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);
    
    // Simulate processing for demo purposes
    setTimeout(() => {
      toast.success(`Selected payment method: ${paymentMethod === 'cashfree' ? 'Cashfree UPI' : 'Stripe'}`);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative max-w-md w-full glass p-6 rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 glass-button p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white text-center">Select Payment Method</h2>

        <div className="glass p-4 rounded-lg mb-6">
          <div className="space-y-3">
            <label className="flex items-center glass p-3 rounded-lg cursor-pointer hover:bg-white/5">
              <input
                type="radio"
                name="paymentMethod"
                value="cashfree"
                checked={paymentMethod === 'cashfree'}
                onChange={() => handlePaymentMethodChange('cashfree')}
                className="mr-3 h-5 w-5 accent-neon-blue"
              />
              <div>
                <span className="text-white font-medium">Continue with Cashfree UPI</span>
                <p className="text-gray-400 text-sm">Pay using UPI, Net Banking, or Cards (India)</p>
              </div>
            </label>
            
            <label className="flex items-center glass p-3 rounded-lg cursor-pointer hover:bg-white/5">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={() => handlePaymentMethodChange('stripe')}
                className="mr-3 h-5 w-5 accent-neon-blue"
              />
              <div>
                <span className="text-white font-medium">Continue with Stripe</span>
                <p className="text-gray-400 text-sm">Pay using Credit/Debit Card (International)</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="glass-button py-2 px-6 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal; 