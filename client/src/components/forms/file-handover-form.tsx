import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

// Form schema
const fileHandoverSchema = z.object({
  handoverToId: z.string({
    required_error: "Please select who to hand over to",
  }),
  handoverMode: z.string().default("manual"),
  notes: z.string().optional(),
});

interface FileHandoverFormProps {
  file: any;
  onCancel: () => void;
  onSuccess: (data: any) => void;
}

export default function FileHandoverForm({ file, onCancel, onSuccess }: FileHandoverFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get list of users for the handover dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Form definition
  const form = useForm<z.infer<typeof fileHandoverSchema>>({
    resolver: zodResolver(fileHandoverSchema),
    defaultValues: {
      handoverToId: "",
      handoverMode: "manual",
      notes: "",
    },
  });
  
  // Handle form submission
  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof fileHandoverSchema>) => {
      const processedValues = {
        ...values,
        fileId: file.id,
        handoverById: user?.id,
        handoverToId: parseInt(values.handoverToId, 10),
      };
      
      return apiRequest("POST", "/api/handovers", processedValues);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      onSuccess(data);
    },
  });
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'under_scanning': return 'bg-yellow-100 text-yellow-800';
      case 'scanning_completed': return 'bg-indigo-100 text-indigo-800';
      case 'qc_pending': return 'bg-orange-100 text-orange-800';
      case 'qc_done': return 'bg-teal-100 text-teal-800';
      case 'upload_pending': return 'bg-purple-100 text-purple-800';
      case 'upload_completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="shadow overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>File Handover Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500">File Details</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Transaction ID:</span>
                <span className="ml-2 text-sm font-medium">{file.transactionId}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">CNR Number:</span>
                <span className="ml-2 text-sm font-medium">{file.cnrNumber}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Case:</span>
                <span className="ml-2 text-sm font-medium">
                  {file.caseType} - {file.caseNumber}/{file.caseYear}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status Information</h3>
            <div className="mt-2 space-y-2">
              <div>
                <span className="text-sm text-gray-500">Current Status:</span>
                <Badge className={`ml-2 ${getStatusColor(file.status)}`}>
                  {formatStatus(file.status)}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-gray-500">Pages:</span>
                <span className="ml-2 text-sm font-medium">{file.pageCount}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Priority:</span>
                <span className="ml-2 text-sm font-medium capitalize">{file.priority}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
            {/* Handover To */}
            <FormField
              control={form.control}
              name="handoverToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handover To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Staff Member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersLoading ? (
                        <SelectItem value="">Loading users...</SelectItem>
                      ) : (
                        users?.filter((u: any) => u.id !== user?.id).map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the staff member who will be responsible for scanning the file
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Handover Mode */}
            <FormField
              control={form.control}
              name="handoverMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handover Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select handover mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="barcode">Barcode</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handover Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any special instructions or observations for the scanning operator"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Processing..." : "Confirm Handover"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
