import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  customerId: z.string(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  invoiceNumber: z.string(),
  items: z.array(z.object({
    itemId: z.number(),
    name: z.string(),
    description: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    taxRate: z.number().min(0),
    discount: z.number().min(0),
  })),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export default function NewInvoice() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ itemId: 0, name: '', description: '', quantity: 1, price: 0, taxRate: 0, discount: 0 }],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type: 'invoice' }),
      });
      if (response.ok) {
        toast({
          title: "Invoice created",
          description: `Invoice ${data.invoiceNumber} has been created.`,
        });
        navigate('/sales/invoices');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "There was a problem creating the invoice. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">New Invoice</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/sales/invoices')}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Save & Send
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer*</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Customer 1</SelectItem>
                          <SelectItem value="2">Customer 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date*</FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date*</FormLabel>
                      <DatePicker date={field.value} setDate={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-neutral-600 px-4">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Tax</div>
                  <div className="col-span-1">Discount</div>
                  <div className="col-span-1"></div>
                </div>

                {form.watch('items').map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start bg-neutral-50 p-4 rounded-lg">
                    <div className="col-span-4 space-y-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Item 1</SelectItem>
                              <SelectItem value="2">Item 2</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <Input placeholder="Description" {...field} />
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <Input type="number" min="1" {...field} />
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <Input type="number" min="0" step="0.01" {...field} />
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <Input type="number" min="0" max="100" {...field} />
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <Input type="number" min="0" {...field} />
                        )}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const items = form.getValues('items');
                          form.setValue('items', items.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const items = form.getValues('items');
                    form.setValue('items', [
                      ...items,
                      { itemId: 0, name: '', description: '', quantity: 1, price: 0, taxRate: 0, discount: 0 },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <Textarea {...field} placeholder="Notes to the customer..." className="min-h-[100px]" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <Textarea {...field} placeholder="Terms and conditions..." className="min-h-[100px]" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}