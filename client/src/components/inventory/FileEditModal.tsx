import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileReceipt } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface FileEditModalProps {
  file: FileReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileEditModal({ file, isOpen, onClose }: FileEditModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create a copy of file for editing
  const [editedFile, setEditedFile] = useState<FileReceipt>({...file});
  
  // Status options
  const statuses = [
    { value: "pending_scan", label: "Pending Scan" },
    { value: "handover", label: "Handed Over" },
    { value: "scanning", label: "Under Scanning" },
    { value: "scan_completed", label: "Scan Completed" },
    { value: "qc_done", label: "QC Done" },
    { value: "upload_initiated", label: "Upload Initiated" },
    { value: "upload_completed", label: "Upload Completed" }
  ];
  
  // Priority options
  const priorities = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];
  
  // Update file status mutation
  const updateStatusMutation = useMutation({
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
        description: "File status has been updated successfully.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update file status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating file status:", error);
    },
  });
  
  // Update file details mutation
  const updateDetailsMutation = useMutation({
    mutationFn: async (data: Partial<FileReceipt> & { id: number }) => {
      return await apiRequest('PUT', `/api/file-receipts/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/file-receipts'] });
      toast({
        title: "Success!",
        description: "File details have been updated successfully.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update file details. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating file details:", error);
    },
  });
  
  const handleStatusChange = (status: string) => {
    setEditedFile({...editedFile, status});
  };
  
  const handleSave = () => {
    // If status has changed, create a lifecycle entry
    if (editedFile.status !== file.status) {
      updateStatusMutation.mutate({
        fileReceiptId: file.id,
        status: editedFile.status,
        updatedById: user?.id || 1,
        remarks: `Status manually changed from ${file.status} to ${editedFile.status}`
      });
    } else {
      // Otherwise just update the file details
      updateDetailsMutation.mutate({
        id: file.id,
        priority: editedFile.priority,
        partyNames: editedFile.partyNames,
        remarks: editedFile.remarks
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit File</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Transaction ID:</span>
              <span className="text-sm text-neutral-800">{file.transactionId}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">CNR Number:</span>
              <span className="text-sm text-neutral-800">{file.cnrNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Case Type:</span>
              <span className="text-sm text-neutral-800">{`${file.caseType} Case ${file.caseNumber}/${file.caseYear}`}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editedFile.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editedFile.priority}
                onValueChange={(priority) => setEditedFile({...editedFile, priority})}
              >
                <SelectTrigger id="edit-priority">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-party-names">Party Names</Label>
              <Input
                id="edit-party-names"
                value={editedFile.partyNames || ''}
                onChange={(e) => setEditedFile({...editedFile, partyNames: e.target.value})}
                placeholder="Enter party names"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-remarks">Remarks</Label>
              <Textarea
                id="edit-remarks"
                value={editedFile.remarks || ''}
                onChange={(e) => setEditedFile({...editedFile, remarks: e.target.value})}
                placeholder="Any special notes or remarks"
                rows={2}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateStatusMutation.isPending || updateDetailsMutation.isPending}
          >
            {updateStatusMutation.isPending || updateDetailsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}