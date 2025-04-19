import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileReceipt } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatTime } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface FileReturnModalProps {
  file: FileReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileReturnModal({ file, isOpen, onClose }: FileReturnModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [remarks, setRemarks] = useState<string>('');
  
  const returnFileMutation = useMutation({
    mutationFn: async (data: {
      fileReceiptId: number;
      status: string;
      updatedById: number;
      remarks: string;
    }) => {
      return await apiRequest('POST', '/api/file-lifecycles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/file-receipts'] });
      toast({
        title: "Success!",
        description: "File has been returned successfully.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to return file. Please try again.",
        variant: "destructive",
      });
      console.error("Error returning file:", error);
    },
  });
  
  const handleReturn = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to return a file.",
        variant: "destructive",
      });
      return;
    }
    
    returnFileMutation.mutate({
      fileReceiptId: file.id,
      status: "returned",
      updatedById: user.id,
      remarks: remarks || "File returned after digitization completion"
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Physical File</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 space-y-2">
            <div className="text-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium">Digitization Complete</h3>
              <p className="text-sm text-neutral-500">
                The digitization process has been completed for this file. You can now return the physical file.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Transaction ID:</span>
              <span className="text-sm text-neutral-800">{file.transactionId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">CNR Number:</span>
              <span className="text-sm text-neutral-800">{file.cnrNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Case Details:</span>
              <span className="text-sm text-neutral-800">{`${file.caseType} Case ${file.caseNumber}/${file.caseYear}`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Received on:</span>
              <span className="text-sm text-neutral-800">{formatDate(file.receivedAt)} {formatTime(file.receivedAt)}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <Label htmlFor="return-remarks">Remarks (optional)</Label>
            <Textarea
              id="return-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks about the file return"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReturn} 
            disabled={returnFileMutation.isPending}
          >
            {returnFileMutation.isPending ? "Processing..." : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}