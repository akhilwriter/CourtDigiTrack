import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DateRangeSelector from "@/components/common/date-range-selector";
import ActivityChart from "@/components/dashboard/activity-chart";
import FileStatusBreakdown from "@/components/dashboard/file-status-breakdown";
import { FileText, Download, BarChart2, Users, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const [reportType, setReportType] = useState("files");
  
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
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reports & MIS</h2>
          <p className="mt-1 text-sm text-gray-600">Generate and view reports on digitization progress</p>
        </div>
        <Button>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>
      
      <DateRangeSelector />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Files</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(stats?.filesByStatus || {}).reduce((sum, count) => sum + count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <BarChart2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Digitization Rate</p>
                <p className="text-2xl font-semibold text-gray-900">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Download className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Uploaded to DSpace</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.filesByStatus?.upload_completed || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Operators</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="progress">Digitization Progress</TabsTrigger>
          <TabsTrigger value="performance">User Performance</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityChart 
              className="lg:col-span-2" 
              data={stats?.activityData || []}
              title="Daily Digitization Activity"
            />
            <FileStatusBreakdown 
              data={stats?.filesByStatus || {}}
              title="Files by Current Status"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Operator Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Files Processed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pages Digitized
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg. Pages/Hour
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quality Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Anita Sharma
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        42
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        3,568
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        76
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        98%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rajiv Kumar
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        35
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2,912
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        65
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        96%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Priya Desai
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        38
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        3,104
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        71
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        99%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <Select
                      value={reportType}
                      onValueChange={setReportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="files">Files Report</SelectItem>
                        <SelectItem value="operators">Operator Performance</SelectItem>
                        <SelectItem value="scanning">Scanning Metrics</SelectItem>
                        <SelectItem value="quality">Quality Control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Format
                    </label>
                    <Select defaultValue="excel">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="block text-sm font-medium text-gray-700 mb-2">
                      Include Fields
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="field-cnr" defaultChecked />
                        <label htmlFor="field-cnr" className="text-sm text-gray-700">CNR Number</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="field-case" defaultChecked />
                        <label htmlFor="field-case" className="text-sm text-gray-700">Case Details</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="field-status" defaultChecked />
                        <label htmlFor="field-status" className="text-sm text-gray-700">Status</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="field-date" defaultChecked />
                        <label htmlFor="field-date" className="text-sm text-gray-700">Date & Time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="field-operator" defaultChecked />
                        <label htmlFor="field-operator" className="text-sm text-gray-700">Operator</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
