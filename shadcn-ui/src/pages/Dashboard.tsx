import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  PieChart,
  Bell,
  CheckCircle,
  XCircle,
  CalendarDays
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function Dashboard() {
  const visitors = useAppStore(state => state.visitors);
  const employees = useAppStore(state => state.employees);
  const activities = useAppStore(state => state.activities);
  const currentUser = useAppStore(state => state.currentUser);
  const currentOrganization = useAppStore(state => state.currentOrganization);
  
  // Calculate statistics
  const activeEmployeeCount = employees.filter(e => e.status === 'active').length;
  const todayVisitors = visitors.filter(v => {
    if (!v.checkInTime) return false;
    const checkInDate = new Date(v.checkInTime).toDateString();
    const today = new Date().toDateString();
    return checkInDate === today;
  }).length;
  
  const checkedInVisitors = visitors.filter(v => v.status === 'checked-in').length;
  const expectedVisitors = visitors.filter(v => v.status === 'expected').length;
  
  // Recent expected visitors (for today and future dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const recentExpectedVisitors = visitors
    .filter(v => v.status === 'expected')
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}
          </p>
        </div>
        <p className="text-muted-foreground text-sm mt-2 sm:mt-0">
          <CalendarDays className="h-4 w-4 inline mr-1" />
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Employees"
          value={activeEmployeeCount}
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
          description="Total active employees"
        />
        <StatCard
          title="Today's Visitors"
          value={todayVisitors}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          description="Visitors checked in today"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Currently Checked In"
          value={checkedInVisitors}
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          description="Visitors in the building"
        />
        <StatCard
          title="Expected Visitors"
          value={expectedVisitors}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="Pre-registered visitors"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9">
        <ActivityFeed />

        <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <CardHeader>
            <CardTitle>Expected Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExpectedVisitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expected visitors at the moment</p>
                <Button asChild className="mt-4">
                  <Link to="/visitors/new">Register New Visitor</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpectedVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {visitor.purpose} • {visitor.company || "No company"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/visitors/${visitor.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}

                {expectedVisitors > 5 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/visitors">View all expected visitors</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 xl:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="justify-start">
              <Link to="/visitors/new">
                <Users className="mr-2 h-4 w-4" />
                Register New Visitor
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link to="/employees/new">
                <UserCheck className="mr-2 h-4 w-4" />
                Add New Employee
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link to="/analytics">
                <PieChart className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link to="/settings">
                <Bell className="mr-2 h-4 w-4" />
                Notification Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}