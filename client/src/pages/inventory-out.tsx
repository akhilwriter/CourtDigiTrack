import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import FileTable from '@/components/inventory/FileTable';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function InventoryOut() {
  const [activeTab, setActiveTab] = useState("pending_handover");
  
  const { refetch } = useQuery({
    queryKey: ['/api/file-receipts'],
    queryFn: () => null, // We're only using this for refetch functionality
    enabled: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Inventory Out</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-neutral-800">Inventory Out - File Handover</h1>
        <div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending_handover" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending_handover">Pending Handover</TabsTrigger>
          <TabsTrigger value="handover">Handed Over</TabsTrigger>
          <TabsTrigger value="all">All Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending_handover">
          <FileTable 
            statusFilter="pending_scan"
            title="Files Pending Handover" 
            description="Files ready to be handed over to scanning operators" 
          />
        </TabsContent>
        
        <TabsContent value="handover">
          <FileTable 
            statusFilter="handover"
            title="Handed Over Files" 
            description="Files that have been handed over for scanning" 
          />
        </TabsContent>
        
        <TabsContent value="all">
          <FileTable 
            title="All Files" 
            description="Complete list of all files in the system" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
