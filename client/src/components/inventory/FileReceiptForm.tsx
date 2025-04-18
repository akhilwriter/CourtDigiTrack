import { useState, useContext } from 'react';
import { AuthContext } from '@/App';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fileReceiptFormSchema } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { getCurrentDateTime, caseTypes } from '@/lib/utils';

import {
  Form,
  FormControl,
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
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Barcode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type FormValues = z.infer<typeof fileReceiptFormSchema>;

export default function FileReceiptForm() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(fileReceiptFormSchema),
    defaultValues: {
      cnrNumber: '',
      caseType: '',
      caseYear: new Date().getFullYear().toString(),
      caseNumber: '',
      pageCount: 0,
      priority: 'normal',
      receivedById: user?.id || 1,
      receivedAt: getCurrentDateTime(),
      remarks: '',
    },
  });

  const createFileReceipt = useMutation({
    mutationFn: async (data: FormValues) => {
      return await apiRequest('POST', '/api/file-receipts', data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/file-receipts'] });
      form.reset({
        cnrNumber: '',
        caseType: '',
        caseYear: new Date().getFullYear().toString(),
        caseNumber: '',
        pageCount: 0,
        priority: 'normal',
        receivedById: user?.id || 1,
        receivedAt: getCurrentDateTime(),
        remarks: '',
      });
      toast({
        title: "Success!",
        description: "File receipt has been saved successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create file receipt. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating file receipt:", error);
    },
  });

  const onSubmit = (data: FormValues) => {
    createFileReceipt.mutate(data);
  };

  const fetchCaseDetails = async (cnrNumber: string) => {
    if (cnrNumber.length < 5) return;
    
    setIsQuerying(true);
    try {
      const response = await fetch(`/api/external/case-details?cnrNumber=${cnrNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case details');
      }
      
      const data = await response.json();
      
      form.setValue('caseType', data.caseType);
      form.setValue('caseYear', data.caseYear);
      form.setValue('caseNumber', data.caseNumber);
      form.setValue('partyNames', data.partyNames);
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch case details. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium">New File Receipt</CardTitle>
        <CardDescription>Enter details of the case file being received for digitization</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="cnrNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNR Number</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Enter CNR Number" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            fetchCaseDetails(e.target.value);
                          }}
                          className="pr-10"
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-neutral-400"
                        onClick={() => {
                          // Simulate scanning a barcode
                          const mockCnr = `DL${Math.floor(10000000 + Math.random() * 90000000)}`;
                          form.setValue('cnrNumber', mockCnr);
                          fetchCaseDetails(mockCnr);
                        }}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">Enter CNR to fetch case details automatically</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Case Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caseYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="YYYY" 
                        min="1900" 
                        max="2099" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Case Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pageCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Pages (approx.)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter page count" 
                        min="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scanning Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
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
              
              <FormField
                control={form.control}
                name="receivedById"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received By</FormLabel>
                    <FormControl>
                      <Input 
                        value={user?.fullName || 'Current User'} 
                        disabled 
                        className="bg-neutral-50" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="receivedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea rows={1} placeholder="Any additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={createFileReceipt.isPending || isQuerying}
              >
                {createFileReceipt.isPending ? "Saving..." : "Save Receipt"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
