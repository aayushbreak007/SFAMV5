import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut,
  BarChart2,
  Building2,
  ShieldCheck,
  PlusCircle,
  QrCode
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth/auth-store";
import { AuthService } from "@/lib/auth/auth-service";

interface SidebarNavProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed }: SidebarNavProps) {
  const { pathname } = useLocation();
  const currentUser = useAppStore(state => state.currentUser);
  const currentOrganization = useAppStore(state => state.currentOrganization);
  
  const { roles, account } = useAuthStore();
  
  // Check roles
  const isSuperAdmin = roles.includes('SuperAdmin');
  const isTenantAdmin = roles.includes('TenantAdmin');
  const isReceptionist = roles.includes('Receptionist');
  const isGuard = roles.includes('Guard');
  
  // Determine if user has admin privileges
  const isAdmin = isSuperAdmin || isTenantAdmin;

  // Common links for all authenticated users
  const links = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Visitors",
      href: "/visitors",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "QR Check-in",
      href: "/qr-checkin",
      icon: <QrCode className="h-4 w-4" />,
    }
  ];

  // Employee management links - available to all except Guards
  const employeeLinks = !isGuard ? [
    {
      title: "Employees",
      href: "/employees",
      icon: <UserCheck className="h-4 w-4" />,
    }
  ] : [];

  // Analytics links - admin only
  const analyticsLinks = isAdmin ? [
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart2 className="h-4 w-4" />,
    }
  ] : [];

  // Admin-only links
  const adminLinks = isAdmin ? [
    {
      title: "Tenant Onboarding",
      href: "/tenants/onboarding",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      title: "Access Control",
      href: "/access-control",
      icon: <ShieldCheck className="h-4 w-4" />,
    }
  ] : [];

  // SuperAdmin only links
  const superAdminLinks = isSuperAdmin ? [
    {
      title: "Organizations",
      href: "/organizations",
      icon: <Building2 className="h-4 w-4" />,
    }
  ] : [];

  // Settings is available for all users
  const bottomLinks = [
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    }
  ];

  const allLinks = [
    ...links, 
    ...employeeLinks,
    ...analyticsLinks,
    ...adminLinks, 
    ...superAdminLinks, 
    ...bottomLinks
  ];

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-background",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b px-4 py-2">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="font-bold text-xl">GateMind</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="flex items-center justify-center w-full">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
          </Link>
        )}
      </div>
      
      {!collapsed && account && (
        <div className="px-4 py-2 border-b">
          <p className="text-sm font-medium">{account.name || account.username}</p>
          <p className="text-xs text-muted-foreground truncate">
            {roles.length > 0 ? roles.join(', ') : 'No roles assigned'}
          </p>
          {currentOrganization && (
            <p className="text-xs text-muted-foreground mt-1">
              {currentOrganization.name}
            </p>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {allLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === link.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start",
                collapsed && "justify-center"
              )}
            >
              {link.icon}
              {!collapsed && <span className="ml-2">{link.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-2 border-t">
        <button
          onClick={handleLogout}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Log out</span>}
        </button>
      </div>
    </div>
  );
}