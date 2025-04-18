import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileStatusBreakdownProps {
  data: Record<string, number>;
  title?: string;
}

export default function FileStatusBreakdown({ data, title = "Files by Status" }: FileStatusBreakdownProps) {
  // Define status labels and colors
  const statusMap: Record<string, { label: string; color: string }> = {
    received: { label: "Received", color: "bg-primary-500" },
    under_scanning: { label: "Under Scanning", color: "bg-secondary-500" },
    scanning_completed: { label: "Scanning Completed", color: "bg-indigo-500" },
    qc_pending: { label: "QC Pending", color: "bg-yellow-500" },
    qc_done: { label: "QC Done", color: "bg-teal-500" },
    upload_pending: { label: "Upload Pending", color: "bg-purple-500" },
    upload_completed: { label: "Upload Completed", color: "bg-green-500" }
  };
  
  // Calculate total for percentages
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {total === 0 ? (
            <div className="text-center p-5 text-gray-500">
              No file data available
            </div>
          ) : (
            Object.entries(data)
              .filter(([status, count]) => statusMap[status]) // Filter out unknown statuses
              .sort(([, countA], [, countB]) => countB - countA) // Sort by count (descending)
              .map(([status, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status} className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {statusMap[status]?.label || status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                        <span className="text-sm font-medium text-gray-500 ml-1">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${statusMap[status]?.color}`}
                      ></div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
