import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserData {
  credits: number;
  uid: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  setUser: (user: User | null) => void;
  setUserData: (userData: UserData | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
}));