import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import React from 'react';

interface PrivateRouteProps {
  children: React.ReactElement;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  return user ? children : <Navigate to="/login" state={{ from: location }} />;
}