import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showingFrom = (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalItems);
  
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Logic for middle pages
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if there's a gap
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{showingFrom}</span> to{" "}
        <span className="font-medium">{showingTo}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>
      <div className="flex-1 flex justify-end">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <Button
            variant="outline"
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              );
            }
            
            return (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
