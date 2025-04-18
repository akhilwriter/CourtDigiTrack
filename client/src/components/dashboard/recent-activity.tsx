import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, FileText, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  activities: any[];
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  // Query to get users
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Query to get files
  const { data: files } = useQuery({
    queryKey: ['/api/files'],
  });
  
  // Helper function to get user name by ID
  const getUserName = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user?.fullName || `User #${userId}`;
  };
  
  // Helper function to get file details by ID
  const getFileDetails = (fileId: number) => {
    const file = files?.find((f: any) => f.id === fileId);
    return file ? `${file.caseType}-${file.caseYear}-${file.caseNumber}` : `File #${fileId}`;
  };
  
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upload_completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'received':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'qc_pending':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };
  
  // Get status background color
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'upload_completed':
        return 'bg-green-100';
      case 'received':
        return 'bg-blue-100';
      case 'qc_pending':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Format time ago
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };
  
  return (
    <Card className="shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-800">Recent Activity</h3>
      </div>
      <CardContent className="p-0">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <li key={activity.id} className="py-4 px-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${getStatusBgColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getFileDetails(activity.fileId)} - {formatStatus(activity.status)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.notes ? activity.notes : `Processed by `}
                        <span className="font-medium">{getUserName(activity.userId)}</span> · {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="rounded-full">
                        View
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-8">
                <div className="text-center text-gray-500">
                  No recent activity to display
                </div>
              </li>
            )}
          </ul>
        </div>
        <div className="px-5 py-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            View all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
