import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage } from './auth/LoginPage';
import { useAuthStore } from '@/lib/auth/auth-store';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <LoginPage />;
}