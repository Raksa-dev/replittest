
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
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const deliveryNoteSchema = z.object({
  transactionNumber: z.string().min(1, "Delivery note number is required"),
  partyId: z.coerce.number().min(1, "Customer is required"),
  transactionDate: z.date(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const NewDeliveryNote = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers = [] } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const response = await fetch('/api/parties');
      const data = await response.json();
      return data.filter((party: any) => party.type === 'customer');
    },
  });

  const form = useForm({
    resolver: zodResolver(deliveryNoteSchema),
    defaultValues: {
      transactionNumber: `DN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      transactionDate: new Date(),
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'delivery_note',
          status: 'completed',
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery note created successfully",
        });
        navigate('/sales/delivery-notes');
      }
    } catch (error) {
      console.error('Error creating delivery note:', error);
      toast({
        title: "Error",
        description: "Failed to create delivery note",
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
          <h1 className="text-2xl font-semibold text-neutral-800">New Delivery Note</h1>
          <p className="text-sm text-neutral-500">Create a new delivery note</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Note Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionNumber">Delivery Note Number</Label>
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
                <Label htmlFor="transactionDate">Date</Label>
                <Input 
                  id="transactionDate"
                  type="date"
                  {...form.register("transactionDate")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input 
                  id="reference"
                  {...form.register("reference")}
                  placeholder="Enter reference number"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/sales/delivery-notes')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Delivery Note'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewDeliveryNote;
