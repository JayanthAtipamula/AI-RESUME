import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export default function PrivateRoute() {
  const user = useAuthStore((state) => state.user);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@resumebuilder.com'; // Replace with your admin email

  if (!user || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
} 