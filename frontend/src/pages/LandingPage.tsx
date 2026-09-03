import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (user !== null) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/auth" replace />;
}
