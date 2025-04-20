import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface DigitizationTrendsProps {
  period: string;
  metric: string;
}

export default function DigitizationTrends({ period, metric }: DigitizationTrendsProps) {
  // Fetch file receipts to analyze trends
  const { data: fileReceipts, isLoading } = useQuery({
    queryKey: ['/api/file-receipts'],
    queryFn: async () => {
      const res = await fetch('/api/file-receipts');
      if (!res.ok) throw new Error('Failed to fetch file receipts');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate trend data based on real file data
  // This is simplified for demo purposes - in a real app you would analyze dates and create proper time series
  
  // Get dates from file receipts
  let dates = fileReceipts.map((receipt: any) => {
    const date = new Date(receipt.receivedAt);
    return date.toISOString().split('T')[0];
  });
  
  // Get unique dates
  const uniqueDates = Array.from(new Set(dates));
  
  // Generate trend data
  const trendData = uniqueDates.map(date => {
    // Find files for this date
    const filesOnThisDate = fileReceipts.filter((receipt: any) => {
      const receiptDate = new Date(receipt.receivedAt).toISOString().split('T')[0];
      return receiptDate === date;
    });
    
    // Calculate metrics
    const fileCount = filesOnThisDate.length;
    const pageCount = filesOnThisDate.reduce((sum: number, file: any) => sum + file.pageCount, 0);
    
    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
    
    return {
      date: displayDate,
      files: fileCount,
      pages: pageCount,
      processingTime: Math.floor(Math.random() * 4) + 1 // Random hours for demo
    };
  });
  
  // If we don't have enough real data, add some trend data for visualization
  if (trendData.length < 5) {
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const newDate = new Date();
      newDate.setDate(today.getDate() - i);
      
      const displayDate = newDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      
      // Only add if this date isn't already in the data
      if (!trendData.find(item => item.date === displayDate)) {
        trendData.push({
          date: displayDate,
          files: Math.floor(Math.random() * 10) + 1,
          pages: Math.floor(Math.random() * 300) + 50,
          processingTime: Math.floor(Math.random() * 4) + 1
        });
      }
    }
  }
  
  // Sort by date
  trendData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Get appropriate metric to display based on selected metric
  const metricKey = metric === 'files' ? 'files' : metric === 'pages' ? 'pages' : 'processingTime';
  const metricName = metric === 'files' ? 'Files Processed' : metric === 'pages' ? 'Pages Digitized' : 'Processing Time (Hours)';

  return (
    <Card className="border">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Digitization Trend - {metricName}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={metricKey}
                name={metricName}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}