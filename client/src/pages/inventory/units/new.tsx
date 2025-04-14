import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

// Create the form schema
const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  formalName: z.string().min(1, "Formal name is required"),
  uqcFrom: z.string().optional().nullable(),
  uqc: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const NewUnit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
      formalName: '',
      uqcFrom: 'GST',
      uqc: '',
    },
  });

  // Create mutation for adding a new unit
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Since we don't have a dedicated endpoint for units yet,
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
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/units'] });
      toast({
        title: "Success",
        description: "Unit of measurement created successfully",
      });
      setLocation('/inventory/units');
    },
    onError: (error) => {
      console.error('Error creating unit:', error);
      toast({
        title: "Error",
        description: "Failed to create unit. Please try again.",
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
          onClick={() => setLocation('/inventory/units')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Add New Unit of Measurement</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Unit Details</CardTitle>
          <CardDescription>
            Enter the details of the new unit of measurement for your inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., KG, PCS, BOX" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Short form used in invoices and reports
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="formalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formal Name*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Kilograms, Pieces, Box" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="uqcFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UQC From</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., GST" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Source of unit quantity code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="uqc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UQC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., KGS, PCS, BOX" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Unit quantity code for GST/e-invoicing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/inventory/units')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Unit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewUnit;