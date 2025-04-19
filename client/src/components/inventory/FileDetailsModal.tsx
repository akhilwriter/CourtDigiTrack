import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileReceipt, FileLifecycle } from '@shared/schema';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { formatDate, formatTime, statusColorMap, priorityColorMap, statusLabels, priorityLabels } from '@/lib/utils';

interface FileDetailsModalProps {
  file: FileReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileDetailsModal({ file, isOpen, onClose }: FileDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch file lifecycle history
  const { data: lifecycles, isLoading } = useQuery<FileLifecycle[]>({
    queryKey: ['/api/file-lifecycles', file.id],
    queryFn: async () => {
      const res = await fetch(`/api/file-lifecycles/${file.id}`);
      if (!res.ok) throw new Error('Failed to fetch lifecycle history');
      return res.json();
    },
    enabled: isOpen && activeTab === "history"
  });
  
  // Render a detail field with label and value
  const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="mb-4">
      <Label className="text-sm font-medium text-neutral-700">{label}</Label>
      <div className="mt-1 text-sm text-neutral-900">{value}</div>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
          <DialogDescription>
            Complete information about file {file.transactionId}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">File Details</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
              <DetailField 
                label="Transaction ID" 
                value={file.transactionId} 
              />
              <DetailField 
                label="CNR Number" 
                value={file.cnrNumber} 
              />
              <DetailField 
                label="Case Type" 
                value={file.caseType} 
              />
              <DetailField 
                label="Case Number" 
                value={`${file.caseNumber}/${file.caseYear}`} 
              />
              <DetailField 
                label="Page Count" 
                value={file.pageCount} 
              />
              <DetailField 
                label="Received Date" 
                value={`${formatDate(file.receivedAt)} ${formatTime(file.receivedAt)}`} 
              />
              <DetailField 
                label="Status" 
                value={
                  <Badge className={`px-2 py-1 rounded-full ${statusColorMap[file.status]?.bg} ${statusColorMap[file.status]?.text}`}>
                    {statusLabels[file.status] || file.status}
                  </Badge>
                } 
              />
              <DetailField 
                label="Priority" 
                value={
                  <Badge className={`px-2 py-1 rounded-full ${priorityColorMap[file.priority]?.bg} ${priorityColorMap[file.priority]?.text}`}>
                    {priorityLabels[file.priority] || file.priority}
                  </Badge>
                } 
              />
            </div>
            
            <Separator className="my-4" />
            
            <DetailField 
              label="Party Names" 
              value={file.partyNames || "Not specified"} 
            />
            <DetailField 
              label="Remarks" 
              value={file.remarks || "None"} 
            />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            {isLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading history...</div>
            ) : !lifecycles || lifecycles.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">No lifecycle history found</div>
            ) : (
              <div className="space-y-4">
                {lifecycles.map((entry) => (
                  <div key={entry.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <Badge className={`px-2 py-1 rounded-full ${statusColorMap[entry.status]?.bg} ${statusColorMap[entry.status]?.text}`}>
                        {statusLabels[entry.status] || entry.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                      </div>
                    </div>
                    {entry.remarks && (
                      <div className="mt-2 text-sm">
                        {entry.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}