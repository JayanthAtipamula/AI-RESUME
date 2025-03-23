import { useEffect, useState } from 'react';
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
import PaymentSuccess from './pages/PaymentSuccess';
import Referrals from './pages/Referrals';
import { storeReferralCode } from './lib/utils';
import { UserData } from './types';

function AppContent() {
  const setUser = useAuthStore((state) => state.setUser);
  const setUserData = useAuthStore((state) => state.setUserData);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
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

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resume/:id" element={<SharedResume />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/referrals" element={<PrivateRoute><Referrals /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default AppContent;