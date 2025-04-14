import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Item, Party, insertTransactionSchema } from '@shared/schema';

// Define the schema for validating the form
const formSchema = insertTransactionSchema.extend({
  partyId: z.coerce.number({
    required_error: "Vendor is required",
  }),
  transactionDate: z.date({
    required_error: "Date is required",
  }),
  expectedDeliveryDate: z.date().optional(),
  notes: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  items: z.array(
    z.object({
      itemId: z.coerce.number({
        required_error: "Item is required",
      }),
      description: z.string().optional().nullable(),
      quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
    })
  ).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

const NewPurchaseQuotationRequest = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<{
    itemId: number;
    description: string | null;
    quantity: number;
  }[]>([]);
  
  // Fetch vendors (parties with type containing 'vendor')
  const { data: vendors } = useQuery<Party[]>({
    queryKey: ['/api/parties', { type: 'vendor' }],
  });
  
  // Fetch inventory items
  const { data: inventoryItems } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });
  
  // Initialize form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: 'purchase_quotation_request',
      transactionNumber: `PQR-${Date.now().toString().substring(6)}`,
      transactionDate: new Date(),
      status: 'draft',
      amount: 0,
      isBnpl: false,
      isSync: false,
      userId: 1, // Hardcoded for demonstration
      items: [],
    },
  });
  
  // Handle removing an item from the list
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Handle adding a new item to the list
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemId: 0,
        description: null,
        quantity: 1,
      },
    ]);
  };
  
  // Update item details when selection changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    
    if (field === 'itemId' && inventoryItems) {
      const selectedItem = inventoryItems.find(item => item.id === Number(value));
      newItems[index] = {
        ...newItems[index],
        itemId: Number(value),
        description: selectedItem?.description || null,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    
    setItems(newItems);
  };
  
  // Create quotation request mutation
  const createQuotationRequest = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create quotation request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Quotation request created successfully',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      // Navigate back to the list
      navigate('/purchases/quotation-requests');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormData) => {
    // Update form data with items
    const formData = {
      ...data,
      items,
    };
    
    createQuotationRequest.mutate(formData);
  };
  
  // Handle form status change and submit
  const handleSubmitWithStatus = (status: string) => {
    form.setValue('status', status);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">New Quotation Request</h1>
          <p className="text-sm text-neutral-500">Request quotations from vendors</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor & Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="transactionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Number</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="partyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
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
                  name="transactionDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Request Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
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
                
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Required By Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Reference or Project Code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter any additional notes for the vendor..." 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Items</span>
                <Button type="button" variant="outline" onClick={handleAddItem}>
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.itemId.toString()}
                            onValueChange={(value) => handleItemChange(index, 'itemId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems?.map((invItem) => (
                                <SelectItem key={invItem.id} value={invItem.id.toString()}>
                                  {invItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Description (optional)"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-neutral-500">No items added yet</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddItem}
                    className="mt-2"
                  >
                    Add Item
                  </Button>
                </div>
              )}
              
              {form.formState.errors.items && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.items.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/purchases/quotation-requests')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmitWithStatus('draft')}
              disabled={createQuotationRequest.isPending}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmitWithStatus('sent')}
              disabled={createQuotationRequest.isPending}
            >
              Send to Vendor
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewPurchaseQuotationRequest;