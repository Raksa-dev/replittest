
import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const returnSchema = z.object({
  returnDate: z.string(),
  invoiceNumber: z.string(),
  reason: z.string(),
  amount: z.string(),
  notes: z.string().optional(),
});

const NewReturn = () => {
  const [, navigate] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(returnSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'sales_return' }),
      });
      
      if (response.ok) {
        navigate('/sales/returns');
      }
    } catch (error) {
      console.error('Error creating return:', error);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-neutral-800 mb-6">Create Sales Return</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <Input 
                  id="returnDate" 
                  type="date" 
                  {...register('returnDate')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input 
                  id="invoiceNumber" 
                  placeholder="Enter invoice number"
                  {...register('invoiceNumber')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Return Reason</Label>
              <Input 
                id="reason" 
                placeholder="Enter return reason"
                {...register('reason')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="Enter amount"
                {...register('amount')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional notes"
                {...register('notes')}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/sales/returns')}
              >
                Cancel
              </Button>
              <Button type="submit">Create Return</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NewReturn;
