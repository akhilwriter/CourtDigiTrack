import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileReceipt } from '@shared/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Share2, Eye, Search, Filter } from "lucide-react";
import HandoverModal from './HandoverModal';
import { formatDate, formatTime, statusColorMap, priorityColorMap, statusLabels, priorityLabels } from '@/lib/utils';

interface FileTableProps {
  statusFilter?: string;
  title?: string;
  description?: string;
}

export default function FileTable({ 
  statusFilter, 
  title = "Recent File Receipts", 
  description = "Showing recently received files pending for scanning"
}: FileTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileReceipt | null>(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: fileReceipts, isLoading, error } = useQuery<FileReceipt[]>({
    queryKey: ['/api/file-receipts', statusFilter],
    queryFn: async () => {
      const endpoint = statusFilter 
        ? `/api/file-receipts?status=${statusFilter}`
        : '/api/file-receipts';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch file receipts');
      return res.json();
    }
  });

  const handleHandoverClick = (file: FileReceipt) => {
    setSelectedFile(file);
    setShowHandoverModal(true);
  };

  const handleViewDetails = (file: FileReceipt) => {
    // In a complete app, this would navigate to a details page
    console.log('View details for file:', file);
  };

  const handleEditFile = (file: FileReceipt) => {
    // In a complete app, this would open an edit form
    console.log('Edit file:', file);
  };

  const filteredReceipts = fileReceipts?.filter(file => 
    file.cnrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Pagination
  const totalPages = Math.ceil((filteredReceipts?.length || 0) / itemsPerPage);
  const paginatedReceipts = filteredReceipts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canHandover = (file: FileReceipt) => file.status === 'pending_scan';

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center flex-row">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search files..."
                className="pl-9 pr-4 py-2 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">Loading file receipts...</div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">Failed to load file receipts</div>
            ) : filteredReceipts.length === 0 ? (
              <div className="p-8 text-center">No file receipts found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50">
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>CNR Number</TableHead>
                    <TableHead>Case Details</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Receipt Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReceipts.map((file) => (
                    <TableRow key={file.id} className="hover:bg-neutral-50">
                      <TableCell className="font-medium">
                        {file.transactionId}
                      </TableCell>
                      <TableCell>{file.cnrNumber}</TableCell>
                      <TableCell>
                        <div>{`${file.caseType} Case ${file.caseNumber}/${file.caseYear}`}</div>
                        <div className="text-xs text-neutral-500">{file.partyNames}</div>
                      </TableCell>
                      <TableCell>{file.pageCount}</TableCell>
                      <TableCell>
                        <div>{formatDate(file.receivedAt)}</div>
                        <div className="text-xs text-neutral-500">{formatTime(file.receivedAt)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-1 rounded-full ${statusColorMap[file.status]?.bg} ${statusColorMap[file.status]?.text}`}>
                          {statusLabels[file.status] || file.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-1 rounded-full ${priorityColorMap[file.priority]?.bg} ${priorityColorMap[file.priority]?.text}`}>
                          {priorityLabels[file.priority] || file.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFile(file)}
                            disabled={!canHandover(file)}
                            className={!canHandover(file) ? "text-neutral-400" : "text-primary hover:text-secondary"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleHandoverClick(file)}
                            disabled={!canHandover(file)}
                            className={!canHandover(file) ? "text-neutral-400" : "text-primary hover:text-secondary"}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(file)}
                            className="text-primary hover:text-secondary"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
        
        {filteredReceipts.length > 0 && (
          <CardFooter className="px-6 py-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}
              </span>{' '}
              of <span className="font-medium">{filteredReceipts.length}</span> entries
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {selectedFile && (
        <HandoverModal
          file={selectedFile}
          isOpen={showHandoverModal}
          onClose={() => setShowHandoverModal(false)}
        />
      )}
    </>
  );
}
