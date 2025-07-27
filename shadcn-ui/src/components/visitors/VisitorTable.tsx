import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building,
  User
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
import { Visitor, Employee } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";

type VisitorStatus = Visitor["status"];

export function VisitorTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const visitors = useAppStore(state => state.visitors);
  const employees = useAppStore(state => state.employees);
  const checkInVisitor = useAppStore(state => state.checkInVisitor);
  const checkOutVisitor = useAppStore(state => state.checkOutVisitor);
  const currentOrganization = useAppStore(state => state.currentOrganization);

  const getHostName = (hostId: string) => {
    const host = employees.find(emp => emp.id === hostId);
    return host ? host.name : "Unknown Host";
  };

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case "expected":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Expected</Badge>;
      case "checked-in":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Checked In</Badge>;
      case "checked-out":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Checked Out</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      visitor.name.toLowerCase().includes(searchLower) ||
      visitor.email.toLowerCase().includes(searchLower) ||
      visitor.company?.toLowerCase().includes(searchLower) ||
      getHostName(visitor.hostId).toLowerCase().includes(searchLower) ||
      visitor.purpose.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visitors</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search visitors..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link to="/visitors/new">
            <Button>New Visitor</Button>
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
                <TableHead>Host</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No visitors found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 mr-2 rounded-full bg-muted flex items-center justify-center">
                          {visitor.photoUrl ? (
                            <img 
                              src={visitor.photoUrl} 
                              alt={visitor.name} 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{visitor.name}</div>
                          <div className="text-xs text-muted-foreground">{visitor.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getHostName(visitor.hostId)}</TableCell>
                    <TableCell>
                      {visitor.company ? (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span>{visitor.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                    <TableCell>
                      {visitor.checkInTime ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{format(new Date(visitor.checkInTime), "HH:mm")}</span>
                          </div>
                          {visitor.checkOutTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Out: {format(new Date(visitor.checkOutTime), "HH:mm")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not checked in</span>
                      )}
                    </TableCell>
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
                            <Link to={`/visitors/${visitor.id}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          {visitor.status === "expected" && (
                            <DropdownMenuItem onClick={() => checkInVisitor(visitor.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              Check in
                            </DropdownMenuItem>
                          )}
                          {visitor.status === "checked-in" && (
                            <DropdownMenuItem onClick={() => checkOutVisitor(visitor.id)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Check out
                            </DropdownMenuItem>
                          )}
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