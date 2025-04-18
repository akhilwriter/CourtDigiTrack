import { useState, useContext } from 'react';
import { AuthContext } from '@/App';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileReceipt } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

interface HandoverModalProps {
  file: FileReceipt;
  isOpen: boolean;
  onClose: () => void;
}

export default function HandoverModal({ file, isOpen, onClose }: HandoverModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [selectedOperator, setSelectedOperator] = useState("");
  const [handoverMode, setHandoverMode] = useState("manual");
  const [remarks, setRemarks] = useState("");
  
  const { data: operators } = useQuery<{id: number, username: string, fullName: string}[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch operators');
      return res.json();
    }
  });

  const handoverMutation = useMutation({
    mutationFn: async (data: {
      fileReceiptId: number;
      handoverById: number;
      handoverToId: number;
      handoverMode: string;
      remarks?: string;
    }) => {
      return await apiRequest('POST', '/api/file-handovers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/file-receipts'] });
      toast({
        title: "Success!",
        description: "File has been handed over successfully.",
        variant: "default",
      });
      onClose();
      // Reset form
      setSelectedOperator("");
      setHandoverMode("manual");
      setRemarks("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to handover file. Please try again.",
        variant: "destructive",
      });
      console.error("Error handing over file:", error);
    },
  });

  const handleConfirmHandover = () => {
    if (!selectedOperator) {
      toast({
        title: "Error",
        description: "Please select an operator to handover the file to.",
        variant: "destructive",
      });
      return;
    }

    handoverMutation.mutate({
      fileReceiptId: file.id,
      handoverById: user?.id || 1,
      handoverToId: parseInt(selectedOperator),
      handoverMode,
      remarks: remarks || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Handover File for Scanning</DialogTitle>
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Case Details:</span>
              <span className="text-sm text-neutral-800">{`${file.caseType} Case ${file.caseNumber}/${file.caseYear}`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Page Count:</span>
              <span className="text-sm text-neutral-800">{file.pageCount}</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handover-to">Handover To</Label>
              <Select
                value={selectedOperator}
                onValueChange={setSelectedOperator}
              >
                <SelectTrigger id="handover-to">
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators?.map(operator => (
                    <SelectItem key={operator.id} value={operator.id.toString()}>
                      {operator.fullName} (Scanner Operator)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="handover-mode">Handover Mode</Label>
              <Select 
                value={handoverMode}
                onValueChange={setHandoverMode}
              >
                <SelectTrigger id="handover-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="barcode">Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="handover-remarks">Remarks</Label>
              <Textarea
                id="handover-remarks"
                placeholder="Any special instructions"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmHandover} 
            disabled={handoverMutation.isPending}
          >
            {handoverMutation.isPending ? "Processing..." : "Confirm Handover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
