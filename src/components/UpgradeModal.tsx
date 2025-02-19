import React, { useState } from 'react';
import { X, Globe, MapPin } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    yearlyPrice: string;
    features: string[];
  };
  isMonthly: boolean;
}

interface CashfreeConfig {
  mode: 'sandbox' | 'production';
}

interface CashfreePaymentConfig {
  orderToken: string;
  onSuccess: (data: any) => void;
  onFailure: (data: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Cashfree: {
      new(config: CashfreeConfig): {
        init: (config: CashfreePaymentConfig) => Promise<void>;
        redirect: () => void;
      };
    }
  }
}

export default function UpgradeModal({ isOpen, onClose, plan, isMonthly }: UpgradeModalProps) {
  const [country, setCountry] = useState<'INDIA' | 'GLOBAL' | null>(null);
  const user = useAuthStore(state => state.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!user) {
      alert('Please log in to continue');
      return;
    }
    
    if (country === 'INDIA') {
      try {
        setIsProcessing(true);
        
        const amount = isMonthly ? 
          Number(plan.price) : 
          (Number(plan.yearlyPrice) * 12);

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        console.log('Sending payment request with data:', {
          orderId,
          amount,
          customerName: user.displayName || 'Anonymous',
          customerEmail: user.email,
          customerPhone: user.phoneNumber || '0000000000'
        });

        const response = await fetch('http://localhost:5000/api/payment/create-quiz-payment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            amount,
            customerName: user.displayName || 'Anonymous',
            customerEmail: user.email,
            customerPhone: user.phoneNumber || '0000000000'
          })
        });

        const data = await response.json();
        console.log('Backend response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Payment creation failed');
        }

        if (!data.success || !data.order?.order_token) {
          console.error('Invalid response structure:', data);
          throw new Error('Invalid payment response');
        }

        // Initialize Cashfree payment
        const cashfree = new window.Cashfree({
          mode: "sandbox"
        });

        const paymentConfig = {
          orderToken: data.order.order_token,
          onSuccess: async function(data: any) {
            console.log("Payment Success:", data);
            try {
              // Update user subscription in database
              await updateUserSubscription(user.uid, {
                plan: plan.name,
                billingType: isMonthly ? 'monthly' : 'yearly',
                startDate: new Date(),
                endDate: new Date(Date.now() + (isMonthly ? 30 : 365) * 24 * 60 * 60 * 1000),
                amount: amount,
                orderId: orderId,
                credits: isMonthly ? 1000 : 12000
              });

              navigate('/dashboard', { 
                state: { 
                  paymentSuccess: true,
                  message: 'Payment successful! Your plan has been upgraded.' 
                }
              });
            } catch (error) {
              console.error('Error updating subscription:', error);
              alert('Payment successful but failed to update subscription. Please contact support.');
            }
          },
          onFailure: function(data: any) {
            console.log("Payment Failure:", data);
            alert("Payment failed. Please try again.");
            setIsProcessing(false);
          },
          onClose: function() {
            console.log("Payment window closed");
            setIsProcessing(false);
          }
        };

        // Initialize payment
        await cashfree.init(paymentConfig);

        // Render payment UI
        cashfree.redirect();

      } catch (error: any) {
        console.error('Payment error:', error);
        alert(error.message || 'Failed to initiate payment. Please try again.');
        setIsProcessing(false);
      }
    } else {
      alert('Global payment not implemented yet');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full p-6 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl text-white mb-6">Upgrade to {plan.name}</h2>

        {!country ? (
          <div className="space-y-4">
            <h3 className="text-lg text-white mb-4">Select your region</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setCountry('INDIA')}
                className="glass-button p-6 flex flex-col items-center gap-2"
              >
                <MapPin className="w-8 h-8" />
                <span>India</span>
              </button>
              <button
                onClick={() => setCountry('GLOBAL')}
                className="glass-button p-6 flex flex-col items-center gap-2"
              >
                <Globe className="w-8 h-8" />
                <span>Global</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass p-4">
              <h4 className="text-lg mb-2">Selected Plan:</h4>
              <p className="text-neon-blue text-2xl font-bold mb-4">
                ₹{isMonthly ? plan.price : plan.yearlyPrice} / month
                {!isMonthly && ' (billed annually)'}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-neon-blue">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full glass-button bg-neon-blue text-black hover:bg-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 