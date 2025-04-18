import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { ChartLine } from "lucide-react";

interface ActivityChartProps {
  data: { date: string; count: number }[];
  className?: string;
  title?: string;
}

export default function ActivityChart({ data, className, title = "Digitization Activity" }: ActivityChartProps) {
  // Format dates for chart display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={true}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={true}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} files`, 'Files']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  name="Files" 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center p-5">
                <ChartLine className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Activity Data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No files have been processed in this period
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
