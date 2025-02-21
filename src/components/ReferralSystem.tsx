import React from 'react';
import { useAuthStore } from '../lib/store';
import { Share2, Copy, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ReferralSystem() {
  const userData = useAuthStore(state => state.userData);

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${userData?.referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    } catch (err) {
      toast.error('Failed to copy referral link');
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-neon-blue" />
            Refer & Earn
          </h2>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>{userData?.referralCount || 0} referrals</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-400">
            Share your referral link and earn 20 credits for each new user who signs up!
          </p>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${window.location.origin}?ref=${userData?.referralCode}`}
              readOnly
              className="glass w-full px-3 py-2 rounded-lg text-white bg-white/5"
            />
            <button
              onClick={copyReferralLink}
              className="glass-button p-2"
              title="Copy referral link"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Your referral code: <span className="text-neon-blue font-mono">{userData?.referralCode}</span>
          </div>
        </div>
      </div>

      {/* Referral History */}
      {userData?.referralHistory?.length > 0 && (
        <div className="glass p-6 rounded-lg space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-blue" />
            Referral History
          </h3>
          <div className="space-y-2">
            {userData.referralHistory.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="text-white">{referral.email}</p>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(referral.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-neon-blue">
                  +{referral.creditsAwarded} credits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show if user was referred */}
      {userData?.referredBy && (
        <div className="glass p-4 rounded-lg">
          <p className="text-sm text-gray-400">
            You were referred by: <span className="text-white">{userData.referredBy.email}</span>
          </p>
        </div>
      )}
    </div>
  );
} 