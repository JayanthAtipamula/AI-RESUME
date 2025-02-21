import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReferralSystem from '../components/ReferralSystem';
import { useAuthStore } from '../lib/store';

export default function Referrals() {
  const userData = useAuthStore(state => state.userData);

  return (
    <div className="min-h-screen px-4 pt-28 pb-12 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/dashboard" className="glass-button">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Referral Program</h1>
        </div>

        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Total Referrals</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {userData?.referralCount || 0}
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Credits Earned</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {(userData?.referralCount || 0) * 20}
              </p>
            </div>
            <div className="glass p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm">Available Credits</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {userData?.credits || 0}
              </p>
            </div>
          </div>

          {/* Referral System Component */}
          <ReferralSystem />
        </div>
      </div>
    </div>
  );
} 