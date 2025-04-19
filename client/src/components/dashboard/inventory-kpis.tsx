import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, HelpCircle, PieChart, BarChart3 } from "lucide-react";

interface InventoryStats {
  totalFiles: number;
  pendingScan: number;
  inScanning: number;
  inQC: number;
  uploadInitiated: number;
  uploadCompleted: number;
  returned: number;
}

interface ChartData {
  name: string;
  value: number;
}

export default function InventoryKPIs() {
  const { data: stats, isLoading } = useQuery<InventoryStats>({
    queryKey: ['/api/stats/inventory'],
    queryFn: async () => {
      const res = await fetch('/api/stats/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory statistics');
      return res.json();
    }
  });
  
  // Function to calculate percentage
  const getPercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  // Process data for chart
  const getChartData = (): ChartData[] => {
    if (!stats) return [];
    
    return [
      { name: "Pending Scan", value: stats.pendingScan },
      { name: "In Scanning", value: stats.inScanning },
      { name: "In QC", value: stats.inQC },
      { name: "Upload Initiated", value: stats.uploadInitiated },
      { name: "Upload Completed", value: stats.uploadCompleted },
      { name: "Returned", value: stats.returned }
    ];
  };
  
  // Generate colors for the stages
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Pending Scan": return "bg-blue-100 text-blue-800";
      case "In Scanning": return "bg-amber-100 text-amber-800";
      case "In QC": return "bg-purple-100 text-purple-800";
      case "Upload Initiated": return "bg-emerald-100 text-emerald-800";
      case "Upload Completed": return "bg-green-100 text-green-800";
      case "Returned": return "bg-neutral-100 text-neutral-800";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };
  
  const chartData = getChartData();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Current Inventory Status</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-neutral-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Summary of all files in the system by their current status.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[120px] w-full rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ) : stats ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-neutral-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-500">Total Files</div>
                  <div className="text-2xl font-semibold">{stats.totalFiles}</div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-neutral-500">In Process</div>
                  <div className="text-xl font-semibold">
                    {stats.pendingScan + stats.inScanning + stats.inQC + stats.uploadInitiated}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-neutral-500">Completed</div>
                  <div className="text-xl font-semibold text-green-600">{stats.uploadCompleted}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-neutral-500">Returned</div>
                  <div className="text-xl font-semibold text-neutral-600">{stats.returned}</div>
                </div>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-3 mt-4">
              <div className="text-sm font-medium mb-1">Files by Status</div>
              <div className="space-y-2">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-24 text-xs text-neutral-600">{item.name}</div>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${getStatusColor(item.name).split(' ')[0]}`}
                          style={{ width: `${getPercentage(item.value, stats.totalFiles)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-12">
                      <span className="text-xs font-medium text-neutral-600">{item.value}</span>
                      <span className="text-xs text-neutral-400">
                        {getPercentage(item.value, stats.totalFiles)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-neutral-500">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}