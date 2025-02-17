import { useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { getUserCredits } from '../lib/firebase';
import { Diamond } from 'lucide-react';

export function UserCredits({ className = "" }: { className?: string }) {
  const { user, userData, setUserData } = useAuthStore();

  useEffect(() => {
    if (user && !userData) {
      getUserCredits(user.uid)
        .then((credits) => {
          setUserData({ credits, uid: user.uid });
        })
        .catch(console.error);
    }
  }, [user, userData, setUserData]);

  if (!userData) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Diamond className="w-4 h-4 text-neon-blue" />
      <span className="text-lg font-bold bg-gradient-to-r from-neon-blue to-[#0099ff] bg-clip-text text-transparent">
        {userData.credits}
      </span>
    </div>
  );
}
