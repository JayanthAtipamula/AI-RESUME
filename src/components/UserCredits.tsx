import React from 'react';
import { useAuthStore } from '../lib/store';
import { Diamond } from 'lucide-react';

function UserCredits({ className = "" }: { className?: string }) {
  const { user, userData } = useAuthStore();

  if (!user) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Diamond className="w-4 h-4 text-neon-blue" />
      <span className="text-lg font-bold bg-gradient-to-r from-neon-blue to-[#0099ff] bg-clip-text text-transparent">
        {userData?.credits ?? '...'}
      </span>
    </div>
  );
}

export default UserCredits;
