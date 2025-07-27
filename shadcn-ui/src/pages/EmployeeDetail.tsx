import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  Edit,
} from "lucide-react";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employee = useAppStore(state => state.employees.find(e => e.id === id));
  const updateEmployee = useAppStore(state => state.updateEmployee);
  const logActivity = useAppStore(state => state.logActivity);
  
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The employee you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/employees">Back to Employees</Link>
        </Button>
      </div>
    );
  }

  const toggleEmployeeStatus = () => {
    const newStatus = employee.status === "active" ? "inactive" : "active";
    updateEmployee(employee.id, { status: newStatus });
    
    logActivity(
      'employee-access',
      `Employee ${employee.name} status changed to ${newStatus}`,
      { userId: employee.id }
    );
  };

  const getAccessLevelBadge = () => {
    switch (employee.accessLevel) {
      case "all":
        return <Badge className="bg-green-100 text-green-800 border-green-200">All Areas</Badge>;
      case "limited":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Limited</Badge>;
      case "restricted":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Restricted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (employee.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{employee.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge()}
            <span className="text-muted-foreground">
              {employee.position}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={employee.status === "active" ? "destructive" : "default"}
            onClick={toggleEmployeeStatus}
          >
            {employee.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          
          <Button variant="outline" asChild>
            <Link to={`/employees/${employee.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {employee.avatarUrl ? (
                  <img 
                    src={employee.avatarUrl} 
                    alt={employee.name} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{employee.position}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Access Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Access Level</p>
                <div className="mt-1">{getAccessLevelBadge()}</div>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-medium mb-2">Access Permissions</h3>
              
              <div className="space-y-1 text-sm">
                {employee.accessLevel === "all" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Main entrance:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Office spaces:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meeting rooms:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Server rooms:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Executive area:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                  </>
                )}
                
                {employee.accessLevel === "limited" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Main entrance:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Office spaces:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meeting rooms:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Server rooms:</span>
                      <span className="text-red-600 font-medium">Denied</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Executive area:</span>
                      <span className="text-red-600 font-medium">Denied</span>
                    </div>
                  </>
                )}
                
                {employee.accessLevel === "restricted" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Main entrance:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Office spaces:</span>
                      <span className="text-green-600 font-medium">Granted</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meeting rooms:</span>
                      <span className="text-red-600 font-medium">Denied</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Server rooms:</span>
                      <span className="text-red-600 font-medium">Denied</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Executive area:</span>
                      <span className="text-red-600 font-medium">Denied</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link to="/employees">
            Back to All Employees
          </Link>
        </Button>
      </div>
    </div>
  );
}