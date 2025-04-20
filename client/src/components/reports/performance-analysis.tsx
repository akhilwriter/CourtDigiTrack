import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';

// Sample user data
const users = [
  { id: 1, username: 'admin', fullName: 'Admin User' },
  { id: 2, username: 'operator1', fullName: 'John Smith' },
  { id: 3, username: 'operator2', fullName: 'Jane Doe' },
  { id: 4, username: 'scanner1', fullName: 'Mike Johnson' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function PerformanceAnalysis() {
  // Fetch file receipts and handovers to analyze performance
  const { data: fileReceipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['/api/file-receipts'],
    queryFn: async () => {
      const res = await fetch('/api/file-receipts');
      if (!res.ok) throw new Error('Failed to fetch file receipts');
      return res.json();
    }
  });

  if (receiptsLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate performance metrics by user
  const userPerformanceData = users.map(user => {
    // Count files received or processed by this user
    // For demo, we'll use random values since we don't have real user assignment data
    const filesHandled = Math.floor(Math.random() * 20) + 5;
    
    return {
      name: user.fullName,
      filesProcessed: filesHandled,
      avgProcessingTime: Math.floor(Math.random() * 30) + 10 // Random minutes per file
    };
  });

  // Calculate metrics for efficiency chart
  const statusData = [
    { name: 'Pending Scan', value: fileReceipts.filter((f: any) => f.status === 'pending_scan').length },
    { name: 'In Scanning', value: fileReceipts.filter((f: any) => f.status === 'scanning' || f.status === 'handover').length },
    { name: 'QC Done', value: fileReceipts.filter((f: any) => f.status === 'qc_done').length },
    { name: 'Upload Initiated', value: fileReceipts.filter((f: any) => f.status === 'upload_initiated').length },
    { name: 'Upload Completed', value: fileReceipts.filter((f: any) => f.status === 'upload_completed').length },
    { name: 'Returned', value: fileReceipts.filter((f: any) => f.status === 'returned').length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Operator Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="filesProcessed" name="Files Processed" fill="#8884d8" />
                <Bar dataKey="avgProcessingTime" name="Avg. Time (min)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Processing Efficiency</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}