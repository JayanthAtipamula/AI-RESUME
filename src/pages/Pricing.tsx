import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import Pricing from '../components/Pricing';

export default function PricingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p className="text-gray-400">
              Select the perfect plan for your resume building needs
            </p>
          </div>

          {/* Add the Pricing component from your home page */}
          <Pricing 
            showTitle={false}
            onSelectPlan={(plan) => {
              if (!user) {
                // If user is not logged in, redirect to login
                navigate('/login', { state: { from: '/pricing', plan } });
              }
              // If user is logged in, the Pricing component will handle the upgrade
            }}
          />
        </div>
      </div>
    </div>
  );
} 