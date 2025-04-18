import { useQuery } from '@tanstack/react-query';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from '@/components/dashboard/StatCard';
import FileTable from '@/components/inventory/FileTable';
import { HourglassIcon, FileTextIcon, FileScan, UploadCloudIcon, PieChart, BarChart, Ellipsis } from 'lucide-react';
import { FileReceipt } from '@shared/schema';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/stats/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    }
  });

  const { data: recentFiles } = useQuery<FileReceipt[]>({
    queryKey: ['/api/file-receipts'],
    queryFn: async () => {
      const res = await fetch('/api/file-receipts');
      if (!res.ok) throw new Error('Failed to fetch recent files');
      return res.json();
    }
  });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Pending Receipt"
          value={statsLoading ? 0 : stats?.pendingReceipt}
          icon={<HourglassIcon className="h-6 w-6" />}
          changeText="12% since yesterday"
          changeValue={12}
          iconBgColor="bg-blue-100"
          iconColor="text-primary"
        />
        <StatCard
          title="Received Today"
          value={statsLoading ? 0 : stats?.receivedToday}
          icon={<FileTextIcon className="h-6 w-6" />}
          changeText="8% since yesterday"
          changeValue={8}
          iconBgColor="bg-green-100"
          iconColor="text-success"
        />
        <StatCard
          title="Scanned Today"
          value={statsLoading ? 0 : stats?.scannedToday}
          icon={<FileScan className="h-6 w-6" />}
          changeText="-3% since yesterday"
          changeValue={-3}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Upload Completed"
          value={statsLoading ? 0 : stats?.uploadCompleted}
          icon={<UploadCloudIcon className="h-6 w-6" />}
          changeText="15% since yesterday"
          changeValue={15}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Digitization Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <div className="w-full h-48 flex items-center justify-center text-neutral-500">
              <PieChart className="h-12 w-12" />
              <div className="ml-4 text-sm">
                <p>Status distribution chart would appear here in a complete implementation.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Processing Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <div className="w-full h-48 flex items-center justify-center text-neutral-500">
              <BarChart className="h-12 w-12" />
              <div className="ml-4 text-sm">
                <p>Weekly processing trend chart would appear here in a complete implementation.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <FileTable 
          title="Recent File Activities" 
          description="Showing the most recent file receipt and processing activities"
        />
      </div>
    </div>
  );
}
