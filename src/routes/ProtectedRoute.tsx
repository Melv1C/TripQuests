import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { CircularProgress, Container } from '@mui/material';
import { currentUserAtom, isAuthLoadingAtom } from '../store/atoms/authAtoms';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * A wrapper component for routes that require authentication.
 * Redirects to the login page if the user is not authenticated.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const currentUser = useAtomValue(currentUserAtom);
  const isAuthLoading = useAtomValue(isAuthLoadingAtom);
  const location = useLocation();

  // Show loading indicator while checking auth state
  if (isAuthLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 