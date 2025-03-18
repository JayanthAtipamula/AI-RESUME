import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from '../lib/toast';
import { useAuthStore } from '../lib/store';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMonthly: boolean;
}

// Renamed to avoid any cached variables
const CHECKOUT_URLS = {
  domestic: {
    month: 'https://payments.cashfree.com/forms?code=1m-pro&redirect_url=https://ai-resume.vercel.app/payment/success',
    year: 'https://payments.cashfree.com/forms?code=1Y-pro&redirect_url=https://ai-resume.vercel.app/payment/success'
  },
  international: {
    month: 'https://buy.polar.sh/polar_cl_G4OPjPIhrURX9BSxFGRYojNOCHW6RThTzzYTD1P7c6H?success_url=https://ai-resume.vercel.app/payment/success',
    year: 'https://buy.polar.sh/polar_cl_NWpOb8N8riuA969yTFNgVBrNBGqOSrBmYtyrv04dksK?success_url=https://ai-resume.vercel.app/payment/success'
  }
};

// Direct URL definitions with the exact URLs from polar.sh and cashfree
const ANNUAL_STRIPE_URL = 'https://buy.polar.sh/polar_cl_NWpOb8N8riuA969yTFNgVBrNBGqOSrBmYtyrv04dksK';
const MONTHLY_STRIPE_URL = 'https://buy.polar.sh/polar_cl_G4OPjPIhrURX9BSxFGRYojNOCHW6RThTzzYTD1P7c6H';
const ANNUAL_CASHFREE_URL = 'https://payments.cashfree.com/forms?code=1Y-pro';
const MONTHLY_CASHFREE_URL = 'https://payments.cashfree.com/forms?code=1m-pro';

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, isMonthly }) => {
  const user = useAuthStore((state) => state.user);
  const [paymentType, setPaymentType] = useState<'domestic' | 'international'>('domestic');

  if (!isOpen) return null;

  const handlePaymentTypeSelection = (type: 'domestic' | 'international') => {
    setPaymentType(type);
  };

  // Completely new function with different name
  const processPayment = () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    // Use direct URL variables instead of object lookup
    let checkoutUrl;
    
    if (paymentType === 'international') {
      checkoutUrl = isMonthly ? MONTHLY_STRIPE_URL : ANNUAL_STRIPE_URL;
    } else {
      checkoutUrl = isMonthly ? MONTHLY_CASHFREE_URL : ANNUAL_CASHFREE_URL;
    }
    
    console.log('Opening payment page in new tab:', checkoutUrl);
    
    // Open in a new tab
    window.open(checkoutUrl, '_blank');
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
                name="paymentType"
                value="domestic"
                checked={paymentType === 'domestic'}
                onChange={() => handlePaymentTypeSelection('domestic')}
                className="mr-3 h-5 w-5 accent-neon-blue"
              />
              <div>
                <span className="text-white font-medium">Cashfree Payment</span>
                <p className="text-gray-400 text-sm">Pay using UPI, Net Banking, or Cards (India)</p>
              </div>
            </label>
            
            <label className="flex items-center glass p-3 rounded-lg cursor-pointer hover:bg-white/5">
              <input
                type="radio"
                name="paymentType"
                value="international"
                checked={paymentType === 'international'}
                onChange={() => handlePaymentTypeSelection('international')}
                className="mr-3 h-5 w-5 accent-neon-blue"
              />
              <div>
                <span className="text-white font-medium">Stripe Payment</span>
                <p className="text-gray-400 text-sm">Pay using Credit/Debit Card (International)</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={processPayment}
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