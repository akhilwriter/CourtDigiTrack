import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FileReceiptForm from "@/components/forms/file-receipt-form";
import FileTable from "@/components/common/file-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import SuccessDialog from "@/components/common/success-dialog";
import Pagination from "@/components/common/pagination";

export default function InventoryIn() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newFileInfo, setNewFileInfo] = useState<any>(null);
  
  const pageSize = 10;
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['/api/files', { limit: pageSize, offset: (currentPage - 1) * pageSize }],
  });
  
  const handleFormSubmitSuccess = (fileData: any) => {
    setNewFileInfo(fileData);
    setShowForm(false);
    setShowSuccessDialog(true);
    refetch();
  };
  
  const handleAddAnotherFile = () => {
    setShowSuccessDialog(false);
    setShowForm(true);
  };
  
  const handleViewDetails = () => {
    setShowSuccessDialog(false);
    // Logic to navigate to file details view would go here
  };
  
  return (
    <div className="space-y-6 pt-14">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory In - File Receipt</h2>
          <p className="mt-1 text-sm text-gray-600">Record and track incoming physical case files for digitization</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add New File
        </Button>
      </div>

      {showForm && (
        <FileReceiptForm 
          onCancel={() => setShowForm(false)} 
          onSuccess={handleFormSubmitSuccess}
        />
      )}

      {/* Recent Receipts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-800">Recently Received Files</h3>
          <div className="flex items-center">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search files..."
                className="pr-10 pl-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 absolute right-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        
        <FileTable 
          files={files || []} 
          isLoading={isLoading}
          showActions={true}
          filteredText={searchQuery}
        />
        
        <Pagination
          currentPage={currentPage}
          totalItems={100} // This would come from the API in a real implementation
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        title="File Successfully Received"
        description="The file has been recorded in the system and is now ready for handover to the scanning department."
        primaryActionText="Add Another File"
        secondaryActionText="View Details"
        onPrimaryAction={handleAddAnotherFile}
        onSecondaryAction={handleViewDetails}
      />
    </div>
  );
}
