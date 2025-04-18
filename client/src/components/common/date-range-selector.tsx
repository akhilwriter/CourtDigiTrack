import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarRange } from "lucide-react";

export default function DateRangeSelector() {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const handleApply = () => {
    // In a real application, this would trigger the data fetching with date range
    console.log("Applying date range:", { startDate, endDate });
  };
  
  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };
  
  return (
    <div className="flex items-center space-x-4 mb-6">
      <CalendarRange className="text-gray-500 h-5 w-5" />
      <span className="text-sm font-medium text-gray-600">Filter by date:</span>
      <div className="relative">
        <Input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <span className="text-gray-500">to</span>
      <div className="relative">
        <Input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
      >
        Apply
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
      >
        Reset
      </Button>
    </div>
  );
}
