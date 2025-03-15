import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from '../lib/toast';
import { useAuthStore } from '../lib/store';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMonthly: boolean;
}

const PAYMENT_LINKS = {
  cashfree: {
    monthly: 'https://payments.cashfree.com/forms?code=1m-pro&redirect_url=https://ai-resume.vercel.app/payment/success',
    annual: 'https://payments.cashfree.com/forms?code=1Y-pro&redirect_url=https://ai-resume.vercel.app/payment/success'
  },
  stripe: {
    monthly: 'https://buy.polar.sh/polar_cl_G4OPjPIhrURX9BSxFGRYojNOCHW6RThTzzYTD1P7c6H?success_url=https://ai-resume.vercel.app/payment/success',
    annual: 'https://buy.polar.sh/polar_cl_G4OPjPIhrURX9BSxFGRYojNOCHW6RThTzzYTD1P7c6H1?success_url=https://ai-resume.vercel.app/payment/success'
  }
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, isMonthly }) => {
  const user = useAuthStore((state) => state.user);
  const [paymentMethod, setPaymentMethod] = useState<'cashfree' | 'stripe'>('cashfree');

  if (!isOpen) return null;

  const handlePaymentMethodChange = (method: 'cashfree' | 'stripe') => {
    setPaymentMethod(method);
  };

  const handleCompletePayment = () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    const billingPeriod = isMonthly ? 'monthly' : 'annual';
    const paymentLink = PAYMENT_LINKS[paymentMethod][billingPeriod];
    window.location.href = paymentLink;
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

        <h2 className="text-2xl font-bold mb-6 text-white text-center">Complete Your Purchase</h2>

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
            onClick={handleCompletePayment}
            className="glass-button py-2 px-6"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;