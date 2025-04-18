import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function LifecycleTracking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("cnr");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/files/cnr/${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        setSearchResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const { data: lifecycleEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/files', searchResults?.id, 'lifecycle-events'],
    enabled: !!searchResults?.id
  });
  
  // Map status to display values and colors
  const statusDisplayMap: Record<string, { label: string, color: string }> = {
    received: { label: "Received", color: "bg-blue-100 text-blue-800" },
    under_scanning: { label: "Under Scanning", color: "bg-yellow-100 text-yellow-800" },
    scanning_completed: { label: "Scanning Completed", color: "bg-indigo-100 text-indigo-800" },
    qc_pending: { label: "QC Pending", color: "bg-orange-100 text-orange-800" },
    qc_done: { label: "QC Done", color: "bg-teal-100 text-teal-800" },
    upload_pending: { label: "Upload Pending", color: "bg-purple-100 text-purple-800" },
    upload_completed: { label: "Upload Completed", color: "bg-green-100 text-green-800" }
  };
  
  return (
    <div className="space-y-6 pt-14">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Lifecycle Tracking</h2>
        <p className="mt-1 text-sm text-gray-600">Track the status of files throughout the digitization process</p>
      </div>
      
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              defaultValue={searchType}
              onValueChange={setSearchType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cnr">CNR Number</SelectItem>
                <SelectItem value="transaction">Transaction ID</SelectItem>
                <SelectItem value="case">Case Number</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="h-5 w-5 text-gray-400 absolute right-3 top-2.5" />
            </div>
            
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Search Results */}
      {searchResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Details */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">File Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                  <p className="text-gray-900">{searchResults.transactionId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">CNR Number</h4>
                  <p className="text-gray-900">{searchResults.cnrNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Case Details</h4>
                  <p className="text-gray-900">{searchResults.caseType} - {searchResults.caseNumber}/{searchResults.caseYear}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Pages</h4>
                  <p className="text-gray-900">{searchResults.pageCount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Current Status</h4>
                  <div className="mt-1">
                    <Badge variant="outline" className={statusDisplayMap[searchResults.status]?.color || "bg-gray-100"}>
                      {statusDisplayMap[searchResults.status]?.label || searchResults.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                  <p className="text-gray-900 capitalize">{searchResults.priority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Lifecycle Events */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Lifecycle Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : lifecycleEvents && lifecycleEvents.length > 0 ? (
                <Tabs defaultValue="timeline">
                  <TabsList className="mb-4">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="list">Event List</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute top-0 left-4 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="space-y-8 pl-10 relative">
                        {lifecycleEvents.map((event: any) => (
                          <div key={event.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute left-[-30px] top-[6px]">
                              <div className="h-5 w-5 rounded-full border-2 border-primary-500 bg-white"></div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium">
                                {statusDisplayMap[event.status]?.label || event.status}
                              </h4>
                              <time className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </time>
                              {event.notes && (
                                <p className="mt-1 text-sm text-gray-600">{event.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="list">
                    <div className="divide-y divide-gray-200">
                      {lifecycleEvents.map((event: any) => (
                        <div key={event.id} className="py-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              {event.status === 'upload_completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : event.status === 'received' ? (
                                <FileText className="h-5 w-5 text-blue-500" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium">
                                {statusDisplayMap[event.status]?.label || event.status}
                              </h4>
                              <time className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </time>
                              {event.notes && (
                                <p className="mt-1 text-xs text-gray-600">{event.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No lifecycle events found for this file
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {searchQuery && !isSearching && !searchResults && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">No file found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No file matching "{searchQuery}" was found in the system
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
