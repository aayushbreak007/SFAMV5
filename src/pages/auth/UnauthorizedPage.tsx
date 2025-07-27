import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AuthService } from '@/lib/auth/auth-service';
import { useAuthStore } from '@/lib/auth/auth-store';

export function UnauthorizedPage() {
  const { roles } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-lg text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
          <h2 className="font-medium text-amber-800 mb-2">Current Access Level</h2>
          <p className="text-sm text-amber-700 mb-2">
            Your current role{roles.length > 1 ? 's' : ''}:
          </p>
          {roles.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-amber-700">
              {roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-700 italic">No roles assigned</p>
          )}
        </div>

        <div className="space-y-4">
          <Button asChild variant="default" className="w-full">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => AuthService.logout()}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;