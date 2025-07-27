import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-5">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-3xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved
          or doesn't exist.
        </p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}