import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityChart from "@/components/dashboard/activity-chart";
import FileStatusBreakdown from "@/components/dashboard/file-status-breakdown";
import RecentActivity from "@/components/dashboard/recent-activity";
import DateRangeSelector from "@/components/common/date-range-selector";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pt-14">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <Button>
            Export Data
          </Button>
        </div>
      </div>

      <DateRangeSelector />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Files Received Today"
          value={stats?.todayFiles || 0}
          icon={<Calendar className="h-6 w-6 text-primary-600" />}
          iconBg="bg-primary-100"
          linkText="View all"
          linkHref="/inventory-in"
        />
        
        <StatsCard
          title="Files Digitized (Last 7 Days)"
          value={stats?.digitizedFiles || 0}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-100"
          linkText="View all"
          linkHref="/reports"
        />
        
        <StatsCard
          title="Pending for Scanning"
          value={stats?.pendingFiles || 0}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          iconBg="bg-yellow-100"
          linkText="View all"
          linkHref="/inventory-out"
        />
        
        <StatsCard
          title="Avg. Pages/Hour"
          value={73}
          icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
          iconBg="bg-indigo-100"
          linkText="View details"
          linkHref="/reports"
        />
      </div>

      {/* Activity Chart and File Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityChart 
          className="lg:col-span-2"
          data={stats?.activityData || []}
        />
        <FileStatusBreakdown 
          data={stats?.filesByStatus || {}}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity 
        activities={stats?.recentEvents || []} 
      />
    </div>
  );
}
