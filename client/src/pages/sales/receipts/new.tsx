
import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  transactionNumber: z.string().min(1, "Receipt number is required"),
  partyId: z.coerce.number().min(1, "Customer is required"),
  transactionDate: z.date(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewReceipt = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/parties'],
    select: (data) => data.filter((party: any) => party.type === 'customer'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionNumber: `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      transactionDate: new Date(),
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          transactionType: 'receipt',
          status: 'completed',
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Receipt created successfully",
        });
        navigate('/sales/receipts');
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to create receipt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">New Receipt</h1>
          <p className="text-sm text-neutral-500">Record a new payment receipt</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionNumber">Receipt Number</Label>
                <Input 
                  id="transactionNumber" 
                  {...form.register("transactionNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partyId">Customer</Label>
                <Select 
                  onValueChange={(value) => form.setValue("partyId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionDate">Receipt Date</Label>
                <DatePicker
                  date={form.getValues("transactionDate")}
                  setDate={(date) => form.setValue("transactionDate", date)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount"
                  type="number"
                  step="0.01"
                  {...form.register("amount")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select onValueChange={(value) => form.setValue("paymentMethod", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input 
                  id="reference"
                  {...form.register("reference")}
                  placeholder="Enter reference number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/sales/receipts')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Receipt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewReceipt;
