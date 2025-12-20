import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // BYPASS: Allow access without login for development/demo
  // To re-enable auth, uncomment the code below
  return <>{children}</>;

  /* Original auth check - uncomment to re-enable:
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
  */
};