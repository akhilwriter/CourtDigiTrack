import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FileTableProps {
  files: any[];
  isLoading: boolean;
  showActions?: boolean;
  filteredText?: string;
  actionText?: string;
  onActionClick?: (file: any) => void;
}

export default function FileTable({
  files,
  isLoading,
  showActions = true,
  filteredText = "",
  actionText = "Edit",
  onActionClick
}: FileTableProps) {
  // Query to get users data to display who received the file
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      received: { label: "Pending for Scanning", color: "bg-yellow-100 text-yellow-800" },
      under_scanning: { label: "Under Scanning", color: "bg-blue-100 text-blue-800" },
      scanning_completed: { label: "Scanning Completed", color: "bg-indigo-100 text-indigo-800" },
      qc_pending: { label: "QC Pending", color: "bg-orange-100 text-orange-800" },
      qc_done: { label: "QC Done", color: "bg-teal-100 text-teal-800" },
      upload_pending: { label: "Upload Pending", color: "bg-purple-100 text-purple-800" },
      upload_completed: { label: "Upload Completed", color: "bg-green-100 text-green-800" }
    };
    
    const { label, color } = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    
    return (
      <Badge variant="outline" className={`${color} capitalize`}>
        {label}
      </Badge>
    );
  };
  
  // Get user name from ID
  const getUserName = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user?.fullName || `User #${userId}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  };
  
  // Filter files if filteredText is provided
  const filteredFiles = filteredText 
    ? files.filter(file => 
        file.cnrNumber.toLowerCase().includes(filteredText.toLowerCase()) ||
        file.transactionId.toLowerCase().includes(filteredText.toLowerCase()) ||
        file.caseNumber.toLowerCase().includes(filteredText.toLowerCase())
      )
    : files;
  
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNR Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Case Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(3)].map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-10" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  if (filteredFiles.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {filteredText ? `No files matching "${filteredText}"` : "No files available"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CNR Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Case Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pages
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Received By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredFiles.map((file) => {
            const formattedDate = formatDate(file.receivedAt);
            return (
              <tr key={file.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {file.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {file.cnrNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{file.caseType.charAt(0).toUpperCase() + file.caseType.slice(1)} Case</div>
                  <div>No. {file.caseNumber}/{file.caseYear}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {file.pageCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getUserName(file.receivedById)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formattedDate.date}</div>
                  <div>{formattedDate.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(file.status)}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/lifecycle-tracking?cnr=${file.cnrNumber}`} className="text-primary-600 hover:text-primary-900 inline-block mr-3">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {onActionClick ? (
                      <Button 
                        onClick={() => onActionClick(file)} 
                        variant="outline" 
                        size="sm"
                      >
                        {actionText}
                      </Button>
                    ) : (
                      <Link to={`/file/${file.id}`} className="text-primary-600 hover:text-primary-900">
                        {actionText}
                      </Link>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
