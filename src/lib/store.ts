import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

interface UserData {
  credits: number;
  uid: string;
  subscription?: {
    plan: 'free' | '1m-pro' | '1y-pro';
    credits: number;
    status: 'active' | 'inactive';
  };
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  setUser: (user: User | null) => void;
  setUserData: (userData: UserData | null) => void;
  updateCredits: (newCredits: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userData: null,
      setUser: (user) => set({ user }),
      setUserData: (userData) => set({ userData }),
      updateCredits: (newCredits) => set((state) => ({
        userData: state.userData ? {
          ...state.userData,
          credits: newCredits,
          subscription: state.userData.subscription ? {
            ...state.userData.subscription,
            credits: newCredits
          } : undefined
        } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);