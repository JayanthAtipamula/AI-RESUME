import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export default function PrivateRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} />;
}