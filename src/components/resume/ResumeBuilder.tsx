import { toast } from 'react-hot-toast';
import { useAuthStore } from '../lib/store';
import { deductCredits } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ResumeBuilder() {
  const user = useAuthStore(state => state.user);
  const userData = useAuthStore(state => state.userData);
  const setUserData = useAuthStore(state => state.setUserData);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userData) return;

    try {
      // Fetch latest credit balance before proceeding
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentCredits = userDoc.data().credits || 0;
      
      // Update local state with latest credits
      setUserData({
        ...userData,
        credits: currentCredits
      });

      if (currentCredits < 10) {
        toast.error(
          <div className="flex flex-col">
            <span className="font-semibold">Insufficient Credits</span>
            <span className="text-sm">
              {currentCredits === 0 
                ? "You have no credits remaining." 
                : `You need ${10 - currentCredits} more credits.`}
            </span>
            <a 
              href="/profile" 
              className="text-sm text-neon-blue hover:underline mt-1"
            >
              Get more credits →
            </a>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
            className: 'bg-zinc-900 text-white'
          }
        );
        return;
      }

      // Proceed with deducting credits
      const newCredits = await deductCredits(user.uid);
      
      setUserData({
        ...userData,
        credits: newCredits,
        subscription: {
          ...userData.subscription,
          credits: newCredits
        }
      });

      // Only proceed with resume generation if credits were successfully deducted
      if (newCredits >= 0) {
        // Your existing resume generation code here
      } else {
        throw new Error('Insufficient credits');
      }

    } catch (error) {
      if (error.message === 'Insufficient credits') {
        toast.error(
          <div className="flex flex-col">
            <span className="font-semibold">Cannot Generate Resume</span>
            <span className="text-sm">You need at least 10 credits.</span>
            <a 
              href="/profile" 
              className="text-sm text-neon-blue hover:underline mt-1"
            >
              Get more credits →
            </a>
          </div>,
          {
            duration: 5000,
            position: 'top-center'
          }
        );
      } else {
        toast.error('Error generating resume');
      }
      console.error('Error:', error);
    }
  };

  const hasEnoughCredits = (userData?.credits || 0) >= 10;

  return (
    <form onSubmit={handleGenerate}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Create Resume</h2>
        <div className="text-sm text-gray-400">
          Credits: <span className={`font-medium ${!hasEnoughCredits ? 'text-red-400' : 'text-white'}`}>
            {userData?.credits || 0}
          </span>
          <span className="text-xs ml-2">(10 credits per resume)</span>
        </div>
      </div>
      
      {/* Your existing form fields */}
      
      <button
        type="submit"
        disabled={!hasEnoughCredits}
        className={`w-full py-2 rounded-lg font-semibold ${
          !hasEnoughCredits
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-neon-blue text-black hover:bg-neon-blue/90'
        }`}
      >
        {!hasEnoughCredits 
          ? `Insufficient Credits (${userData?.credits || 0}/10)` 
          : 'Generate Resume'}
      </button>
    </form>
  );
} 