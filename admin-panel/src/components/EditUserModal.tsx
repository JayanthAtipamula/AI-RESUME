import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateUserSubscription, updateUserCredits } from '../lib/firebase';

interface EditUserModalProps {
  user: {
    id: string;
    email: string;
    subscription: {
      plan: 'free' | '1m-pro' | '1y-pro';
      credits: number;
      status: 'active' | 'inactive';
    };
  };
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [plan, setPlan] = useState<'free' | '1m-pro' | '1y-pro'>(user.subscription?.plan || 'free');
  const [credits, setCredits] = useState(user.subscription?.credits || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If switching to free plan, force credits to 30
      const finalCredits = plan === 'free' ? 30 : credits;
      await updateUserSubscription(user.id, plan, finalCredits);
      // Force an update to refresh the data
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsChange = async (newCredits: number) => {
    // Don't allow credit changes for free plan
    if (plan === 'free') {
      setCredits(30);
      return;
    }
    setCredits(newCredits);
    try {
      await updateUserCredits(user.id, newCredits);
      // Force an update to refresh the data
      onUpdate();
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  // Update credits when plan changes
  const handlePlanChange = (newPlan: 'free' | '1m-pro' | '1y-pro') => {
    setPlan(newPlan);
    if (newPlan === 'free') {
      setCredits(30);
    } else if (credits < 1000) {
      setCredits(1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          Edit User: {user.email}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Subscription Plan
            </label>
            <select
              value={plan}
              onChange={(e) => handlePlanChange(e.target.value as 'free' | '1m-pro' | '1y-pro')}
              className="w-full glass p-2 rounded-lg text-white bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              style={{ 
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="free" className="bg-zinc-800 text-white">Free (30 credits)</option>
              <option value="1m-pro" className="bg-zinc-800 text-white">Monthly Pro (1000 credits)</option>
              <option value="1y-pro" className="bg-zinc-800 text-white">Yearly Pro (1000 credits/month)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Credits
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={credits}
                onChange={(e) => handleCreditsChange(parseInt(e.target.value) || 0)}
                className="w-full glass p-2 rounded-lg text-white bg-zinc-800/50"
                min="0"
                disabled={plan === 'free'}
                style={{ color: 'white' }}
              />
              <button
                type="button"
                onClick={() => handleCreditsChange(credits + 1000)}
                className={`glass-button whitespace-nowrap ${plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={plan === 'free'}
              >
                +1000
              </button>
            </div>
            {plan === 'free' && (
              <p className="text-sm text-gray-400 mt-1">Free plan is limited to 30 credits</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-neon-blue text-black font-semibold py-2 rounded-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neon-blue/90'
              }`}
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}