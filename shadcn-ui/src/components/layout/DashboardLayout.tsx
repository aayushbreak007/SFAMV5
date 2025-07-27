import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/lib/store";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentUser = useAppStore(state => state.currentUser);
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          sidebarCollapsed={sidebarCollapsed} 
        />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}