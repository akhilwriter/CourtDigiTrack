import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';
import FileReceiptForm from '@/components/inventory/FileReceiptForm';
import FileTable from '@/components/inventory/FileTable';
import { useQuery } from '@tanstack/react-query';

export default function InventoryIn() {
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
            <BreadcrumbPage>Inventory In</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-neutral-800">Inventory In - File Receipt</h1>
        <div>
          <Button variant="outline" className="mr-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Receipt
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <FileReceiptForm />
      </div>

      <div>
        <FileTable 
          statusFilter="pending_scan"
          title="Recent File Receipts" 
          description="Showing recently received files pending for scanning" 
        />
      </div>
    </div>
  );
}
