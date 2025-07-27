import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { useEffect, useState } from 'react';

// MSAL imports
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalInstance } from './lib/auth/auth-service';
import { AuthService } from './lib/auth/auth-service';
import { useAuthStore } from './lib/auth/auth-store';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Visitors from './pages/Visitors';
import VisitorDetail from './pages/VisitorDetail';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import QRCheckIn from './pages/QRCheckIn';
import AccessControl from './pages/AccessControl';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Components
import { VisitorForm } from './components/visitors/VisitorForm';
import { EmployeeForm } from './components/employees/EmployeeForm';
import { TenantOnboardingForm } from './components/tenants/TenantOnboardingForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient();

const AuthorizedRoute = ({ children, requiredRoles = [] }: { children: React.ReactNode; requiredRoles?: string[] }) => {
  const { isAuthenticated, hasAnyRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthenticationInitializer />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected routes */}
              <Route element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Tenant Management - SuperAdmin or TenantAdmin only */}
                <Route 
                  path="/tenants/onboarding" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <TenantOnboardingForm />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Visitor routes - All authenticated users */}
                <Route path="/visitors" element={<Visitors />} />
                <Route 
                  path="/visitors/new" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'Receptionist']}>
                      <VisitorForm />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/visitors/:id" element={<VisitorDetail />} />
                <Route 
                  path="/visitors/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'Receptionist']}>
                      <EditVisitor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/qr-checkin" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'Receptionist']}>
                      <QRCheckIn />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Employee routes - SuperAdmin, TenantAdmin, or Receptionist */}
                <Route 
                  path="/employees" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'Receptionist']}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/employees/new" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <EmployeeForm />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/employees/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'Receptionist']}>
                      <EmployeeDetail />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/employees/:id/edit" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <EditEmployee />
                    </ProtectedRoute>
                  }
                />
                
                {/* Analytics - SuperAdmin or TenantAdmin only */}
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                
                {/* Settings - SuperAdmin or TenantAdmin only */}
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                
                {/* Access Control - SuperAdmin or TenantAdmin only */}
                <Route 
                  path="/access-control" 
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin']}>
                      <AccessControl />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 for authenticated users */}
                <Route path="*" element={<NotFound />} />
              </Route>
              
              {/* Default route - redirect based on authentication */}
              <Route path="/" element={<DefaultRedirect />} />
              
              {/* 404 catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MsalProvider>
  );
};

// Component to initialize authentication on app load
const AuthenticationInitializer = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await AuthService.initializeAuth();
      setIsInitialized(true);
    };

    initialize();
  }, []);

  return null;
};

// Helper component to edit a visitor
function EditVisitor() {
  const { id } = useParams<{ id: string }>();
  const visitors = useAppStore(state => state.visitors);
  const visitor = visitors.find(v => v.id === id);
  
  if (!visitor) {
    return <Navigate to="/visitors" />;
  }
  
  return <VisitorForm existingVisitor={visitor} />;
}

// Helper component to edit an employee
function EditEmployee() {
  const { id } = useParams<{ id: string }>();
  const employees = useAppStore(state => state.employees);
  const employee = employees.find(e => e.id === id);
  
  if (!employee) {
    return <Navigate to="/employees" />;
  }
  
  return <EmployeeForm existingEmployee={employee} />;
}

// Helper component to redirect based on auth status
function DefaultRedirect() {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
}

export default App;