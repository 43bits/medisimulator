/**
 * Root redirect — sends authenticated users to tabs, others to login.
 */
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen message="Loading session…" />;
  return <Redirect href={isAuthenticated ? '/(tabs)/dashboard' : '/login'} />;
}
