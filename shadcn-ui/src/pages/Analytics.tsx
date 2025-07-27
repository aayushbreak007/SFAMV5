import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import { PieChart, BarChart } from "@/components/ui/chart";

export default function Analytics() {
  const visitors = useAppStore(state => state.visitors);
  const employees = useAppStore(state => state.employees);
  const activities = useAppStore(state => state.activities);
  
  // Calculate visitor statistics
  const visitorStatuses = {
    expected: visitors.filter(v => v.status === 'expected').length,
    checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    checkedOut: visitors.filter(v => v.status === 'checked-out').length,
  };
  
  const visitorPurposes: Record<string, number> = {};
  visitors.forEach(visitor => {
    if (!visitorPurposes[visitor.purpose]) {
      visitorPurposes[visitor.purpose] = 0;
    }
    visitorPurposes[visitor.purpose]++;
  });
  
  // Calculate employee statistics
  const employeesByDepartment: Record<string, number> = {};
  employees.forEach(employee => {
    if (!employeesByDepartment[employee.department]) {
      employeesByDepartment[employee.department] = 0;
    }
    employeesByDepartment[employee.department]++;
  });
  
  const employeesByAccessLevel = {
    all: employees.filter(e => e.accessLevel === 'all').length,
    limited: employees.filter(e => e.accessLevel === 'limited').length,
    restricted: employees.filter(e => e.accessLevel === 'restricted').length,
  };
  
  // Prepare chart data
  const visitorStatusData = {
    labels: ['Expected', 'Checked In', 'Checked Out'],
    datasets: [
      {
        label: 'Visitors by Status',
        data: [visitorStatuses.expected, visitorStatuses.checkedIn, visitorStatuses.checkedOut],
        backgroundColor: ['#3b82f6', '#22c55e', '#94a3b8'],
      },
    ],
  };
  
  const visitorPurposeData = {
    labels: Object.keys(visitorPurposes),
    datasets: [
      {
        label: 'Visitors by Purpose',
        data: Object.values(visitorPurposes),
        backgroundColor: [
          '#3b82f6',
          '#22c55e',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6',
          '#10b981',
        ],
      },
    ],
  };
  
  const employeeDepartmentData = {
    labels: Object.keys(employeesByDepartment),
    datasets: [
      {
        label: 'Employees by Department',
        data: Object.values(employeesByDepartment),
        backgroundColor: [
          '#3b82f6',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
          '#22c55e',
        ],
      },
    ],
  };
  
  const employeeAccessData = {
    labels: ['All Areas', 'Limited', 'Restricted'],
    datasets: [
      {
        label: 'Employees by Access Level',
        data: [
          employeesByAccessLevel.all,
          employeesByAccessLevel.limited,
          employeesByAccessLevel.restricted,
        ],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
      },
    ],
  };
  
  // Activity data
  const activityTypes = {
    'visitor-checkin': activities.filter(a => a.type === 'visitor-checkin').length,
    'visitor-checkout': activities.filter(a => a.type === 'visitor-checkout').length,
    'employee-access': activities.filter(a => a.type === 'employee-access').length,
    'system': activities.filter(a => a.type === 'system').length,
  };
  
  const activityData = {
    labels: ['Check-in', 'Check-out', 'Access', 'System'],
    datasets: [
      {
        label: 'Activities by Type',
        data: [
          activityTypes['visitor-checkin'],
          activityTypes['visitor-checkout'],
          activityTypes['employee-access'],
          activityTypes['system'],
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#94a3b8'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and statistics about your facility
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Status</CardTitle>
            <CardDescription>Distribution of visitors by their current status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={visitorStatusData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Visit Purposes</CardTitle>
            <CardDescription>Distribution of visitors by purpose of visit</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={visitorPurposeData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Employees by department</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart data={employeeDepartmentData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Access Level Distribution</CardTitle>
            <CardDescription>Employees by access level</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart data={employeeAccessData} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Recent activities by type</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart data={activityData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}