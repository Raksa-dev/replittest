import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

// Create the form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hsnCode: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sellingPrice: z.string().optional().nullable(),
  purchasePrice: z.string().optional().nullable(),
  openingStock: z.string().optional().nullable(),
  minStockLevel: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const NewStockItem = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch units for dropdown
  const { data: units } = useQuery({
    queryKey: ['/api/inventory/units'],
  });

  // Fetch stock groups for dropdown
  const { data: stockGroups } = useQuery({
    queryKey: ['/api/inventory/stock-groups'],
  });

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hsnCode: '',
      unit: '',
      category: '',
      description: '',
      sellingPrice: '',
      purchasePrice: '',
      openingStock: '0',
      minStockLevel: '0',
    },
  });

  // Create mutation for adding a new stock item
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          userId: 1, // This would come from auth in a real app
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/summary'] });
      toast({
        title: "Success",
        description: "Stock item created successfully",
      });
      setLocation('/inventory/stock-items');
    },
    onError: (error) => {
      console.error('Error creating stock item:', error);
      toast({
        title: "Error",
        description: "Failed to create stock item. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    mutation.mutate(values);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => setLocation('/inventory/stock-items')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Add New Stock Item</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Stock Item Details</CardTitle>
          <CardDescription>
            Enter the details of the new stock item to add to your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter item name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter HSN code" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Harmonized System of Nomenclature code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measurement</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units?.map((unit: any) => (
                            <SelectItem key={unit.id} value={unit.symbol}>
                              {unit.symbol} - {unit.formalName}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Group</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stock group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stockGroups?.map((group: any) => (
                            <SelectItem key={group.id} value={group.name}>
                              {group.name}
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
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="openingStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          value={field.value || '0'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          value={field.value || '0'}
                        />
                      </FormControl>
                      <FormDescription>
                        Alert when stock falls below this level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter item description" 
                        {...field} 
                        value={field.value || ''}
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/inventory/stock-items')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Stock Item
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStockItem;