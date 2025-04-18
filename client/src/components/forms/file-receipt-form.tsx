import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Form schema based on our data model
const fileReceiptSchema = z.object({
  cnrNumber: z.string().min(1, "CNR number is required"),
  caseType: z.enum(["civil", "criminal", "writ", "appeal", "revision", "other"], {
    required_error: "Case type is required",
  }),
  caseYear: z.string().refine((val) => {
    const year = parseInt(val, 10);
    return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear();
  }, {
    message: "Please enter a valid year",
  }),
  caseNumber: z.string().min(1, "Case number is required"),
  pageCount: z.string().refine((val) => {
    const count = parseInt(val, 10);
    return !isNaN(count) && count > 0;
  }, {
    message: "Page count must be a positive number",
  }),
  receivedById: z.string({
    required_error: "Please select who received the file",
  }),
  priority: z.enum(["normal", "high", "urgent"], {
    required_error: "Priority is required",
  }).default("normal"),
  notes: z.string().optional(),
});

interface FileReceiptFormProps {
  onCancel: () => void;
  onSuccess: (file: any) => void;
}

export default function FileReceiptForm({ onCancel, onSuccess }: FileReceiptFormProps) {
  const [isFetching, setIsFetching] = useState(false);
  const queryClient = useQueryClient();
  
  // Get list of users for the receiver dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Form definition
  const form = useForm<z.infer<typeof fileReceiptSchema>>({
    resolver: zodResolver(fileReceiptSchema),
    defaultValues: {
      cnrNumber: "",
      caseType: "civil",
      caseYear: new Date().getFullYear().toString(),
      caseNumber: "",
      pageCount: "",
      receivedById: "",
      priority: "normal",
      notes: "",
    },
  });
  
  // Handle form submission
  const submitMutation = useMutation({
    mutationFn: async (values: z.infer<typeof fileReceiptSchema>) => {
      const processedValues = {
        ...values,
        caseYear: parseInt(values.caseYear, 10),
        pageCount: parseInt(values.pageCount, 10),
        receivedById: parseInt(values.receivedById, 10),
      };
      
      return apiRequest("POST", "/api/files", processedValues);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      onSuccess(data);
    },
  });
  
  // Function to fetch case details from CNR
  const fetchCaseDetails = async (cnrNumber: string) => {
    if (!cnrNumber || cnrNumber.length < 5) return;
    
    setIsFetching(true);
    try {
      // In a real application, this would call an external API
      // For now, we'll just simulate a response after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate finding data for specific CNR patterns
      if (cnrNumber.startsWith("DLHC")) {
        const lastThree = cnrNumber.slice(-3);
        const caseYear = (2020 + (parseInt(lastThree) % 4)).toString();
        const caseNumber = Math.floor(Math.random() * 9000 + 1000).toString();
        
        form.setValue("caseType", "civil");
        form.setValue("caseYear", caseYear);
        form.setValue("caseNumber", caseNumber);
      }
    } catch (error) {
      console.error("Error fetching case details:", error);
    } finally {
      setIsFetching(false);
    }
  };
  
  return (
    <Card className="shadow overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>File Receipt Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* CNR Number */}
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="cnrNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNR Number</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="XXXX0000000000"
                            className="rounded-r-none"
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-l-none"
                          onClick={() => fetchCaseDetails(field.value)}
                          disabled={isFetching}
                        >
                          {isFetching ? "Fetching..." : "Fetch Data"}
                        </Button>
                      </div>
                      <FormDescription>
                        Enter CNR number to automatically fetch case details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Case Type */}
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Case Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="civil">Civil</SelectItem>
                          <SelectItem value="criminal">Criminal</SelectItem>
                          <SelectItem value="writ">Writ Petition</SelectItem>
                          <SelectItem value="appeal">Appeal</SelectItem>
                          <SelectItem value="revision">Revision</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Case Year */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="caseYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={new Date().getFullYear().toString()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Case Number */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="12345" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Page Count */}
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="pageCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Pages (approx.)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Received By */}
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="receivedById"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received By</FormLabel>
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
                            users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.fullName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Priority */}
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scanning Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any special instructions or observations"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {submitMutation.isPending ? "Submitting..." : "Record Receipt"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
