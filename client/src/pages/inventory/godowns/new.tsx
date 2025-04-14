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
  parentName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const NewGodown = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing godowns for parent dropdown
  const { data: godowns } = useQuery({
    queryKey: ['/api/inventory/godowns'],
  });

  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      parentName: null,
      address: '',
    },
  });

  // Create mutation for adding a new godown
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Since we don't have a dedicated endpoint for godowns yet,
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
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/godowns'] });
      toast({
        title: "Success",
        description: "Godown created successfully",
      });
      setLocation('/inventory/godowns');
    },
    onError: (error) => {
      console.error('Error creating godown:', error);
      toast({
        title: "Error",
        description: "Failed to create godown. Please try again.",
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
          onClick={() => setLocation('/inventory/godowns')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Add New Godown</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Godown Details</CardTitle>
          <CardDescription>
            Enter the details of the new warehouse or storage location
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
                      <FormLabel>Godown Name*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter godown name" 
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
                      <FormLabel>Parent Godown</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent godown (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {godowns?.map((godown: any) => (
                            <SelectItem key={godown.id} value={godown.name}>
                              {godown.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave empty if this is a main godown
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter godown address" 
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
                  onClick={() => setLocation('/inventory/godowns')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Godown
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewGodown;