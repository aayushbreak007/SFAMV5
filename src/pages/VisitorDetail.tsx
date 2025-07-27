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
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertTriangle,
  FileText,
  Edit,
} from "lucide-react";
import { format } from "date-fns";

export default function VisitorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitor = useAppStore(state => state.visitors.find(v => v.id === id));
  const employees = useAppStore(state => state.employees);
  const checkInVisitor = useAppStore(state => state.checkInVisitor);
  const checkOutVisitor = useAppStore(state => state.checkOutVisitor);
  const currentOrganization = useAppStore(state => state.currentOrganization);
  
  if (!visitor) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Visitor Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The visitor you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/visitors">Back to Visitors</Link>
        </Button>
      </div>
    );
  }

  const host = employees.find(e => e.id === visitor.hostId);
  const customFields = currentOrganization?.settings.customFields || [];

  const handleCheckIn = () => {
    checkInVisitor(visitor.id);
  };

  const handleCheckOut = () => {
    checkOutVisitor(visitor.id);
  };

  const getStatusBadge = () => {
    switch (visitor.status) {
      case "expected":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Expected</Badge>;
      case "checked-in":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Checked In</Badge>;
      case "checked-out":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Checked Out</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{visitor.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge()}
            <span className="text-muted-foreground">
              {visitor.purpose}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {visitor.status === "expected" && (
            <Button onClick={handleCheckIn}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Check In
            </Button>
          )}
          
          {visitor.status === "checked-in" && (
            <Button onClick={handleCheckOut}>
              <XCircle className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link to={`/visitors/${visitor.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{visitor.name}</p>
                <p className="text-sm text-muted-foreground">Visitor</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{visitor.email}</span>
              </div>
              
              {visitor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{visitor.phone}</span>
                </div>
              )}
              
              {visitor.company && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{visitor.company}</span>
                </div>
              )}
            </div>
            
            {visitor.agreementSigned && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-green-500" />
                <span>NDA Signed</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{host?.name || "Unknown Host"}</p>
                <p className="text-sm text-muted-foreground">
                  {host?.department} • {host?.position}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {visitor.checkInTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Checked in at {format(new Date(visitor.checkInTime), "h:mm a")}</span>
                </div>
              )}
              
              {visitor.checkOutTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span>Checked out at {format(new Date(visitor.checkOutTime), "h:mm a")}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <span className="font-medium">Purpose:</span>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">{visitor.purpose}</div>
                </div>
              </div>
            </div>
            
            {/* Custom fields */}
            {visitor.customFields && Object.keys(visitor.customFields).length > 0 && (
              <div className="border-t pt-3 mt-4">
                <h3 className="text-sm font-medium mb-2">Additional Information</h3>
                
                <div className="space-y-1 text-sm">
                  {Object.entries(visitor.customFields).map(([fieldId, value]) => {
                    const fieldDef = customFields.find(f => f.id === fieldId);
                    return fieldDef ? (
                      <div key={fieldId} className="flex justify-between">
                        <span className="text-muted-foreground">{fieldDef.name}:</span>
                        <span className="font-medium">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link to="/visitors">
            Back to All Visitors
          </Link>
        </Button>
      </div>
    </div>
  );
}