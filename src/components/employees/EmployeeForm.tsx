import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Employee } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { UserRoundPlus } from "lucide-react";

type EmployeeFormProps = {
  existingEmployee?: Employee;
};

export function EmployeeForm({ existingEmployee }: EmployeeFormProps) {
  const navigate = useNavigate();
  const createEmployee = useAppStore(state => state.createEmployee);
  const updateEmployee = useAppStore(state => state.updateEmployee);
  
  const [formData, setFormData] = useState<Partial<Employee>>(
    existingEmployee || {
      name: "",
      email: "",
      department: "",
      position: "",
      phone: "",
      accessLevel: "limited",
      status: "active"
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.position) newErrors.position = "Position is required";
    
    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (existingEmployee) {
        updateEmployee(existingEmployee.id, formData);
        toast.success("Employee updated successfully");
      } else {
        createEmployee(formData);
        toast.success("Employee added successfully");
      }
      navigate("/employees");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{existingEmployee ? "Edit Employee" : "Add New Employee"}</CardTitle>
          <CardDescription>
            {existingEmployee 
              ? "Update employee information" 
              : "Add a new employee to your organization"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employee Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleInputChange}
                />
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Software Engineer"
                  value={formData.position}
                  onChange={handleInputChange}
                />
                {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value) => handleSelectChange("accessLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {existingEmployee && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/employees")}
          >
            Cancel
          </Button>
          <Button type="submit">
            <UserRoundPlus className="mr-2 h-4 w-4" />
            {existingEmployee ? "Update Employee" : "Add Employee"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}