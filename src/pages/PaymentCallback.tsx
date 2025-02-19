import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        const orderStatus = searchParams.get('order_status');

        if (orderStatus === 'PAID') {
          setStatus('Payment successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard', {
              state: {
                paymentSuccess: true,
                message: 'Payment successful! Your plan has been upgraded.'
              }
            });
          }, 2000);
        } else {
          setStatus('Payment failed. Redirecting...');
          setTimeout(() => {
            navigate('/dashboard', {
              state: {
                paymentSuccess: false,
                message: 'Payment failed. Please try again.'
              }
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('Error verifying payment');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="glass p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue mx-auto mb-4"></div>
        <p className="text-white">{status}</p>
      </div>
    </div>
  );
} 