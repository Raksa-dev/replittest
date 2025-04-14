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
  parentName: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  gstRate: z.coerce.number().min(0).max(100).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const NewStockGroup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing stock groups for parent dropdown
  const { data: stockGroups } = useQuery({
    queryKey: ['/api/inventory/stock-groups'],
  });

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      parentName: null,
      hsnCode: '',
      gstRate: null,
    },
  });

  // Create mutation for adding a new stock group
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Since we don't have a dedicated endpoint for stock groups yet,
      // we're mocking the success for now
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Math.floor(Math.random() * 1000) + 10,
            ...values,
            userId: 1,
          });
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/stock-groups'] });
      toast({
        title: "Success",
        description: "Stock group created successfully",
      });
      setLocation('/inventory/stock-groups');
    },
    onError: (error) => {
      console.error('Error creating stock group:', error);
      toast({
        title: "Error",
        description: "Failed to create stock group. Please try again.",
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

  const gstRateOptions = [0, 5, 12, 18, 28];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2"
          onClick={() => setLocation('/inventory/stock-groups')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Add New Stock Group</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Stock Group Details</CardTitle>
          <CardDescription>
            Enter the details of the new stock group for organizing your inventory items
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
                      <FormLabel>Group Name*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter group name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Group</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent group (optional)" />
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
                      <FormDescription>
                        Leave empty if this is a top-level group
                      </FormDescription>
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
                  name="gstRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Rate (%)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseFloat(value))} 
                        defaultValue={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select GST rate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gstRateOptions.map((rate) => (
                            <SelectItem key={rate} value={rate.toString()}>
                              {rate}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/inventory/stock-groups')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Stock Group
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStockGroup;