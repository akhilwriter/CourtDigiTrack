import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileReceipt } from '@shared/schema';
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, statusColorMap, priorityColorMap, statusLabels, priorityLabels } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileDetailsModalProps {
  file: FileReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileDetailsModal({ file, isOpen, onClose }: FileDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>File Details</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2 px-0">
              <CardTitle className="text-lg flex justify-between">
                <span>{file.transactionId}</span>
                <div className="flex space-x-2">
                  <Badge className={`${statusColorMap[file.status]?.bg} ${statusColorMap[file.status]?.text}`}>
                    {statusLabels[file.status] || file.status}
                  </Badge>
                  <Badge className={`${priorityColorMap[file.priority]?.bg} ${priorityColorMap[file.priority]?.text}`}>
                    {priorityLabels[file.priority] || file.priority}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">CNR Number</h4>
                  <p className="text-base">{file.cnrNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Case Type</h4>
                  <p className="text-base capitalize">{file.caseType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Case Number</h4>
                  <p className="text-base">{file.caseNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Case Year</h4>
                  <p className="text-base">{file.caseYear}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Party Names</h4>
                  <p className="text-base">{file.partyNames || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Page Count</h4>
                  <p className="text-base">{file.pageCount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Received At</h4>
                  <p className="text-base">{formatDateTime(file.receivedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Received By</h4>
                  <p className="text-base">ID: {file.receivedById}</p>
                </div>
              </div>
              
              {file.remarks && (
                <>
                  <Separator className="mb-4" />
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-1">Remarks</h4>
                    <p className="text-base text-neutral-700">{file.remarks}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}