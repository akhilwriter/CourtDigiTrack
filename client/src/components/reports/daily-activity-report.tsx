import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface DailyActivityReportProps {
  date: string;
  reportType: string;
}

export default function DailyActivityReport({ date, reportType }: DailyActivityReportProps) {
  const formattedDate = new Date(date).toISOString().split('T')[0];

  // Fetch file receipts
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

  // Filter data for the selected date if needed
  const filteredReceipts = fileReceipts.filter((receipt: any) => {
    // If date is today, show all for demo purposes
    // In a real app, we would filter by the actual date
    return true;
  });

  // If no data, show message
  if (filteredReceipts.length === 0) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center h-72 text-neutral-500">
        <div className="text-center">
          <p className="text-sm">No activity data available for the selected date.</p>
        </div>
      </div>
    );
  }

  // Render different report formats based on reportType
  if (reportType === 'summary') {
    // Count files by status
    const statusCounts: Record<string, number> = {};
    
    filteredReceipts.forEach((receipt: any) => {
      const status = receipt.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return (
      <Card className="border">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Daily Summary Report</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(statusCounts).map(([status, count]) => (
                <TableRow key={status}>
                  <TableCell className="font-medium capitalize">
                    {status.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{filteredReceipts.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Detailed report (default)
  return (
    <Card className="border">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Detailed Activity Report</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>CNR Number</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Pages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt: any) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.transactionId}</TableCell>
                  <TableCell>{receipt.cnrNumber}</TableCell>
                  <TableCell className="capitalize">{receipt.caseType}</TableCell>
                  <TableCell>{formatDate(receipt.receivedAt)}</TableCell>
                  <TableCell className="capitalize">{receipt.status?.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right">{receipt.pageCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}