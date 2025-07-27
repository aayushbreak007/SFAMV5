import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserCheck, 
  LogOut, 
  AlertTriangle, 
  Settings, 
  User,
  RefreshCw
} from "lucide-react";
import { Activity } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const activities = useAppStore(state => state.activities);
  
  // Get the most recent activities
  const displayActivities = showAll ? activities : activities.slice(0, 5);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'visitor-checkin':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'visitor-checkout':
        return <LogOut className="h-4 w-4 text-orange-500" />;
      case 'employee-access':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActivityTypeLabel = (type: Activity['type']) => {
    switch (type) {
      case 'visitor-checkin':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Check In</Badge>;
      case 'visitor-checkout':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Check Out</Badge>;
      case 'employee-access':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Access</Badge>;
      case 'system':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">System</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {displayActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      {getActivityTypeLabel(activity.type)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {activities.length > 5 && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "View all activity"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}