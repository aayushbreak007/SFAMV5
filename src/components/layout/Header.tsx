import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  toggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ toggleSidebar, sidebarCollapsed }: HeaderProps) {
  const currentUser = useAppStore(state => state.currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userInitials = currentUser ? currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="hidden md:flex"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Avatar>
          <AvatarImage src={currentUser?.avatarUrl} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </div>
      
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </header>
  );
}