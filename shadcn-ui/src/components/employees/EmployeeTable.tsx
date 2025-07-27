import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  User,
  Building2,
  Briefcase,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Employee } from "@/lib/types";
import { useAppStore } from "@/lib/store";

export function EmployeeTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const employees = useAppStore(state => state.employees);
  const updateEmployee = useAppStore(state => state.updateEmployee);
  const logActivity = useAppStore(state => state.logActivity);

  const getAccessLevelBadge = (level: Employee["accessLevel"]) => {
    switch (level) {
      case "all":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">All Areas</Badge>;
      case "limited":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Limited</Badge>;
      case "restricted":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Restricted</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const toggleEmployeeStatus = (employee: Employee) => {
    const newStatus = employee.status === "active" ? "inactive" : "active";
    updateEmployee(employee.id, { status: newStatus });
    
    logActivity(
      'employee-access',
      `Employee ${employee.name} status changed to ${newStatus}`,
      { userId: employee.id }
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      employee.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employees</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/employees/new">
            <Button>Add Employee</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div className="flex items-center">
                    Name 
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center">
                          {employee.avatarUrl ? (
                            <img 
                              src={employee.avatarUrl} 
                              alt={employee.name} 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.department}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{employee.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getAccessLevelBadge(employee.accessLevel)}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEmployeeStatus(employee)}>
                            {employee.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/employees/${employee.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}