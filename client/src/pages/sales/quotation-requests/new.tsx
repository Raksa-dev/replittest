import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { insertTransactionSchema } from '@shared/schema';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, ChevronLeftIcon } from 'lucide-react';

// Create schema validation for form
const formSchema = insertTransactionSchema.extend({
  transactionDate: z.date(),
  partyId: z.coerce.number().min(1, { message: "Please select a customer" }),
  amount: z.coerce.number().min(0, { message: "Amount must be at least 0" }),
}).omit({ 
  balanceDue: true, 
  isBnpl: true,
  isSync: true,
});

// Define form default values
const defaultValues = {
  transactionNumber: '',
  transactionType: 'quotation_request' as const,
  transactionDate: new Date(),
  partyId: undefined as unknown as number,
  amount: 0,
  dueDate: undefined as unknown as Date | undefined,
  status: 'open' as const,
  notes: '',
  reference: '',
  userId: 1, // Mock user ID for now
};

type FormValues = z.infer<typeof formSchema>;

const NewQuotationRequest = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch customers for dropdown
  const { data: parties } = useQuery({
    queryKey: ['/api/parties', { type: 'customer' }],
  });
  
  // Set up form handling
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Set up mutation for form submission
  const createTransaction = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Quotation Request Created",
        description: "The quotation request has been successfully created.",
      });
      navigate('/sales/quotation-requests');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error creating the quotation request. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createTransaction.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => navigate('/sales/quotation-requests')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Quotation Requests
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">New Quotation Request</h1>
          <p className="text-sm text-neutral-500">Create a new quotation request from a customer</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
              <CardDescription>Basic information about the quotation request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transactionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request ID</FormLabel>
                      <FormControl>
                        <Input placeholder="QR-2025-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique identifier for this request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="partyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parties?.map((party) => (
                            <SelectItem key={party.id} value={party.id.toString()}>
                              {party.name}
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Approximate budget or order value (if known)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer reference" {...field} />
                      </FormControl>
                      <FormDescription>
                        Reference number from the customer (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Response Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Select a date (optional)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the quotation request in detail (products/services required, specifications, etc.)" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/sales/quotation-requests')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Quotation Request"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default NewQuotationRequest;