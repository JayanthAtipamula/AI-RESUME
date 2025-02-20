import React, { useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { Diamond } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function UserCredits({ className = "" }: { className?: string }) {
  const { user, userData, setUserData } = useAuthStore();

  useEffect(() => {
    const fetchLatestCredits = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching latest credits:', error);
      }
    };

    // Fetch credits when component mounts
    fetchLatestCredits();
  }, [user, setUserData]);

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
