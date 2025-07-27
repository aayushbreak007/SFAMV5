import { EmployeeTable } from "@/components/employees/EmployeeTable";

export default function Employees() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage employees and access permissions
        </p>
      </div>
      <EmployeeTable />
    </div>
  );
}