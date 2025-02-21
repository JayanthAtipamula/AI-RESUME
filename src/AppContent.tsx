import React, { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './lib/store';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SharedResume from './pages/SharedResume';
import PrivateRoute from './components/PrivateRoute';
import PaymentCallback from './pages/PaymentCallback';
import Referrals from './pages/Referrals';
import { storeReferralCode } from './lib/utils';

function AppContent() {
  const setUser = useAuthStore((state) => state.setUser);
  const setUserData = useAuthStore((state) => state.setUserData);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserData]);

  // Check for referral code when app loads
  useEffect(() => {
    const referralCode = searchParams.get('ref');
    if (referralCode) {
      storeReferralCode(referralCode);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/r/:resumeId" element={<SharedResume />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/referrals" element={<Referrals />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppContent; 