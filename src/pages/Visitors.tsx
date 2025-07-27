import { VisitorTable } from "@/components/visitors/VisitorTable";

export default function Visitors() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
        <p className="text-muted-foreground">
          Manage your visitors, check-ins and check-outs
        </p>
      </div>
      <VisitorTable />
    </div>
  );
}