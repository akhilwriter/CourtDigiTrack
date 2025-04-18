import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FileHandoverForm from "@/components/forms/file-handover-form";
import FileTable from "@/components/common/file-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SuccessDialog from "@/components/common/success-dialog";
import Pagination from "@/components/common/pagination";

export default function InventoryOut() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [handoverInfo, setHandoverInfo] = useState<any>(null);
  
  const pageSize = 10;
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['/api/files', { status: 'received', limit: pageSize, offset: (currentPage - 1) * pageSize }],
  });
  
  const handleSelectFile = (file: any) => {
    setSelectedFile(file);
  };
  
  const handleHandoverSuccess = (handoverData: any) => {
    setHandoverInfo(handoverData);
    setSelectedFile(null);
    setShowSuccessDialog(true);
    refetch();
  };
  
  const handleContinue = () => {
    setShowSuccessDialog(false);
  };
  
  return (
    <div className="space-y-6 pt-14">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory Out - File Handover</h2>
          <p className="mt-1 text-sm text-gray-600">Track movement of files from storage to digitization desk</p>
        </div>
      </div>

      {selectedFile ? (
        <FileHandoverForm 
          file={selectedFile}
          onCancel={() => setSelectedFile(null)} 
          onSuccess={handleHandoverSuccess}
        />
      ) : (
        <>
          {/* Files Available for Handover */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800">Files Available for Handover</h3>
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
              actionText="Handover"
              onActionClick={handleSelectFile}
            />
            
            <Pagination
              currentPage={currentPage}
              totalItems={100} // This would come from the API in a real implementation
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        title="File Successfully Handed Over"
        description="The file has been handed over for scanning. File status has been updated to 'Under Scanning'."
        primaryActionText="Continue"
        onPrimaryAction={handleContinue}
      />
    </div>
  );
}
