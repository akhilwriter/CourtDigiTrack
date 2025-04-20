import { useState } from 'react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DownloadIcon, BarChart, PieChart, LineChart } from 'lucide-react';
import DailyActivityReport from '@/components/reports/daily-activity-report';
import PerformanceAnalysis from '@/components/reports/performance-analysis';
import DigitizationTrends from '@/components/reports/digitization-trends';

export default function Reports() {
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportType, setReportType] = useState('summary');
  const [trendPeriod, setTrendPeriod] = useState('weekly');
  const [trendMetric, setTrendMetric] = useState('files');
  const [showReport, setShowReport] = useState(false);
  
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reports & MIS</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-neutral-800">Reports & Management Information System</h1>
      </div>

      <Tabs defaultValue="daily-reports">
        <TabsList className="mb-6">
          <TabsTrigger value="daily-reports">Daily Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="trends">Digitization Trends</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily-reports">
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle>Daily Activity Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <Label htmlFor="report-date">Report Date</Label>
                  <Input 
                    id="report-date" 
                    type="date" 
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select 
                    value={reportType}
                    onValueChange={(value) => setReportType(value)}
                  >
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="report-format">Export Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="report-format">
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="w-full"
                    onClick={() => setShowReport(true)}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
              
              {showReport ? (
                <DailyActivityReport date={reportDate} reportType={reportType} />
              ) : (
                <div className="border rounded-lg p-8 flex items-center justify-center h-72 text-neutral-500">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-sm">
                      Please select report parameters and click "Generate Report" to view the report.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceAnalysis />
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Digitization Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="trend-period">Time Period</Label>
                  <Select 
                    value={trendPeriod}
                    onValueChange={(value) => setTrendPeriod(value)}
                  >
                    <SelectTrigger id="trend-period">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="trend-metric">Metric</Label>
                  <Select 
                    value={trendMetric}
                    onValueChange={(value) => setTrendMetric(value)}
                  >
                    <SelectTrigger id="trend-metric">
                      <SelectValue placeholder="Select Metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="files">Files Processed</SelectItem>
                      <SelectItem value="pages">Pages Digitized</SelectItem>
                      <SelectItem value="time">Processing Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={() => setShowReport(true)}>
                    Update Chart
                  </Button>
                </div>
              </div>
              
              <DigitizationTrends period={trendPeriod} metric={trendMetric} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="custom-start-date">Start Date</Label>
                  <Input id="custom-start-date" type="date" />
                </div>
                <div>
                  <Label htmlFor="custom-end-date">End Date</Label>
                  <Input id="custom-end-date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <Label htmlFor="custom-type">Case Type</Label>
                  <Select>
                    <SelectTrigger id="custom-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="writ">Writ Petition</SelectItem>
                      <SelectItem value="appeal">Appeal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom-status">Status</Label>
                  <Select>
                    <SelectTrigger id="custom-status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending_scan">Pending Scan</SelectItem>
                      <SelectItem value="handover">Handover</SelectItem>
                      <SelectItem value="scanning">Scanning</SelectItem>
                      <SelectItem value="qc_done">QC Done</SelectItem>
                      <SelectItem value="upload_completed">Upload Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="custom-fields">Report Fields</Label>
                  <Select>
                    <SelectTrigger id="custom-fields">
                      <SelectValue placeholder="Select Fields" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Fields</SelectItem>
                      <SelectItem value="detailed">Detailed Fields</SelectItem>
                      <SelectItem value="minimal">Minimal Fields</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom-format">Export Format</Label>
                  <Select defaultValue="excel">
                    <SelectTrigger id="custom-format">
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Generate Custom Report
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-8 flex items-center justify-center h-60 text-neutral-500">
                <div className="text-center">
                  <p className="text-sm">
                    Configure your custom report parameters and click "Generate Custom Report" to create and download your report.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
