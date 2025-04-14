import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { insertTransactionSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

const formSchema = insertTransactionSchema.extend({
  partyId: z.coerce.number().min(1, "Please select a vendor"),
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
  expectedDeliveryDate: z.date().optional(),
  items: z.array(z.object({
    itemId: z.number(),
    description: z.string(),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
    taxPercentage: z.number().default(0),
    taxAmount: z.number().default(0),
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPurchaseOrder() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: parties = [], isLoading: partiesLoading } = useQuery({
    queryKey: ['/api/parties'],
    select: (data) => data.filter((party: any) => party.type === 'vendor'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: 'purchase_order',
      transactionNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'draft',
      transactionDate: new Date(),
      dueDate: null,
      amount: 0,
      balanceDue: 0,
      notes: '',
      reference: '',
      paymentTerms: 'net_30',
      userId: 1,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);
      
      // Submit the form
      const response = await apiRequest('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Show success message
      toast({
        title: "Purchase Order created",
        description: `Purchase Order ${data.transactionNumber} has been created.`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({queryKey: ['/api/transactions']});
      
      // Redirect to orders list
      setLocation('/purchases/orders');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the purchase order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Create New Purchase Order</h1>
          <p className="text-sm text-neutral-500">Create a new purchase order to send to a vendor</p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/purchases/orders')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Details</CardTitle>
              <CardDescription>Enter the basic details for this purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionNumber">PO Number</Label>
                  <Input 
                    id="transactionNumber"
                    {...form.register("transactionNumber")}
                    placeholder="PO-2023-001"
                  />
                  {form.formState.errors.transactionNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.transactionNumber.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partyId">Vendor</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("partyId", parseInt(value))}
                    defaultValue={form.getValues("partyId")?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((party: any) => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.partyId && (
                    <p className="text-sm text-red-500">{form.formState.errors.partyId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Order Date</Label>
                  <DatePicker
                    date={form.getValues("transactionDate") as Date}
                    setDate={(date) => form.setValue("transactionDate", date)}
                  />
                  {form.formState.errors.transactionDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.transactionDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                  <DatePicker
                    date={form.getValues("expectedDeliveryDate") as Date | undefined}
                    setDate={(date) => form.setValue("expectedDeliveryDate", date)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("status", value)}
                    defaultValue={form.getValues("status")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="partially_received">Partially Received</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input 
                    id="reference"
                    {...form.register("reference")}
                    placeholder="REF-001"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes for the vendor..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>You can add items to this purchase order after creating it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-center text-neutral-500">
                You'll be able to add items after creating the purchase order
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">₹0.00</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setLocation('/purchases/orders')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}