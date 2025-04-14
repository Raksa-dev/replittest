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
    required_error: "Payment date is required",
  }),
  relatedBillId: z.coerce.number().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  referenceNumber: z.string().optional(),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPayment() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: parties = [], isLoading: partiesLoading } = useQuery({
    queryKey: ['/api/parties'],
    select: (data) => data.filter((party: any) => party.type === 'vendor'),
  });

  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    select: (data) => data.filter((transaction: any) => transaction.transactionType === 'bill'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: 'payment',
      transactionNumber: `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'completed',
      transactionDate: new Date(),
      dueDate: null,
      amount: 0,
      balanceDue: 0,
      notes: '',
      reference: '',
      paymentMethod: '',
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
        title: "Payment created",
        description: `Payment ${data.transactionNumber} has been recorded.`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({queryKey: ['/api/transactions']});
      
      // Redirect to payments list
      setLocation('/purchases/payments');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem recording the payment. Please try again.",
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
          <h1 className="text-2xl font-semibold text-neutral-800">Record New Payment</h1>
          <p className="text-sm text-neutral-500">Record a payment made to a vendor</p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/purchases/payments')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter the payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionNumber">Payment Number</Label>
                  <Input 
                    id="transactionNumber"
                    {...form.register("transactionNumber")}
                    placeholder="PAY-2023-001"
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
                  <Label htmlFor="transactionDate">Payment Date</Label>
                  <DatePicker
                    date={form.getValues("transactionDate") as Date}
                    setDate={(date) => form.setValue("transactionDate", date)}
                  />
                  {form.formState.errors.transactionDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.transactionDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount"
                    type="number"
                    step="0.01"
                    {...form.register("amount")}
                    placeholder="0.00"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("paymentMethod", value)}
                    defaultValue={form.getValues("paymentMethod")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="online_payment">Online Payment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input 
                    id="referenceNumber"
                    {...form.register("referenceNumber")}
                    placeholder="Check number, transaction ID, etc."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relatedBillId">Bill Being Paid</Label>
                <Select 
                  onValueChange={(value) => form.setValue("relatedBillId", parseInt(value))}
                  defaultValue={form.getValues("relatedBillId")?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bill (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Advance Payment)</SelectItem>
                    {bills.map((bill: any) => (
                      <SelectItem key={bill.id} value={bill.id.toString()}>
                        {bill.transactionNumber} - ₹{bill.amount.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes about this payment..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardFooter className="flex justify-end space-x-2 pt-6">
              <Button variant="outline" type="button" onClick={() => setLocation('/purchases/payments')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}