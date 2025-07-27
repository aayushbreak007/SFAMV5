import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/lib/auth/auth-service';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useMsal } from '@azure/msal-react';

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle login button click
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await AuthService.login();
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to login. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Smart Facility Access Management</CardTitle>
          <CardDescription className="text-center">
            Sign in with your organization account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              This application uses Azure Active Directory for authentication
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}