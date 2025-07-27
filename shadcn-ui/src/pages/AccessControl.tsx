import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { Employee } from "@/lib/types";
import { Shield, Search, UserCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";

export default function AccessControl() {
  const employees = useAppStore((state) => state.employees);
  const updateEmployee = useAppStore((state) => state.updateEmployee);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("employees");
  
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.department.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower)
    );
  });

  // Handle access level change
  const handleAccessChange = (employeeId: string, accessLevel: Employee['accessLevel']) => {
    updateEmployee(employeeId, { accessLevel });
    toast.success("Access level updated successfully");
  };

  // Get badge for access level
  const getAccessBadge = (accessLevel: string) => {
    switch (accessLevel) {
      case "all":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Full Access</Badge>;
      case "limited":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Limited</Badge>;
      case "restricted":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Restricted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground">
            Manage access levels for employees and areas
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Employee Access</TabsTrigger>
          <TabsTrigger value="areas">Access Areas</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Employee Access Levels
              </CardTitle>
              <CardDescription>
                Manage which employees have access to different areas and features
              </CardDescription>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Access</TableHead>
                      <TableHead className="w-[150px]">Access Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mb-2" />
                            <p>No employees found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {employee.avatarUrl ? (
                                  <img
                                    src={employee.avatarUrl}
                                    alt={employee.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div>{employee.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {employee.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{getStatusBadge(employee.status)}</TableCell>
                          <TableCell>{getAccessBadge(employee.accessLevel)}</TableCell>
                          <TableCell>
                            <Select
                              defaultValue={employee.accessLevel}
                              onValueChange={(value) =>
                                handleAccessChange(employee.id, value as Employee['accessLevel'])
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select access" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Full Access</SelectItem>
                                <SelectItem value="limited">Limited</SelectItem>
                                <SelectItem value="restricted">Restricted</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="areas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Access Areas
              </CardTitle>
              <CardDescription>
                Configure access restrictions for different areas in your facility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 border rounded-md bg-muted/50">
                <div className="text-center">
                  <Shield className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">Area Management Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This feature will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">Access Logs</CardTitle>
              <CardDescription>
                View a history of access events across your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 border rounded-md bg-muted/50">
                <div className="text-center">
                  <Shield className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                  <h3 className="font-medium">Access Logs Coming Soon</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Access logs will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}