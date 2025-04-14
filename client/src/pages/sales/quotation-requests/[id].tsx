import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeftIcon,
  ClipboardIcon,
  CalendarIcon,
  UserIcon,
  InboxIcon,
  TagIcon
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getTransactionTypeLabel,
  getStatusLabel
} from '@/lib/utils';
import { Transaction, Party } from '@shared/schema';

const QuotationRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Fetch quotation request data
  const { 
    data: request, 
    isLoading: requestLoading,
    isError: requestError
  } = useQuery<Transaction>({
    queryKey: ['/api/transactions', id],
    enabled: !!id,
  });
  
  // Fetch customer data if we have a party ID
  const { 
    data: customer,
    isLoading: customerLoading 
  } = useQuery<Party>({
    queryKey: ['/api/parties', request?.partyId],
    enabled: !!request?.partyId,
  });
  
  // Mutation to update the request status
  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest(`/api/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status,
          notes: internalNotes ? `${request?.notes || ''}\n\n---\nInternal Notes (${new Date().toLocaleDateString()}):\n${internalNotes}` : request?.notes
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', id] });
      toast({
        title: "Status Updated",
        description: `The quotation request status has been updated to ${getStatusLabel(newStatus)}.`,
      });
      setStatusDialogOpen(false);
      setNewStatus('');
      setInternalNotes('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle status update
  const handleStatusUpdate = () => {
    if (newStatus) {
      updateStatus.mutate(newStatus);
    }
  };
  
  // Handle request cancellation
  const handleCancelRequest = () => {
    updateStatus.mutate('cancelled');
    setCancelDialogOpen(false);
  };
  
  if (requestLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-neutral-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
                  <div className="h-10 bg-neutral-100 rounded w-full"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (requestError || !request) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => navigate('/sales/quotation-requests')}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Quotation Requests
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load quotation request</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The quotation request could not be found or there was an error loading the data.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/sales/quotation-requests')}>
              Return to Quotation Requests
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {getStatusLabel(status)}
      </span>
    );
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1" 
          onClick={() => navigate('/sales/quotation-requests')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Quotation Requests
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">
            {request.transactionNumber}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-neutral-500">
              {getTransactionTypeLabel(request.transactionType)}
            </span>
            <StatusBadge status={request.status} />
            <span className="text-sm text-neutral-500">
              {formatDate(request.transactionDate)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Status</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Status</DialogTitle>
                <DialogDescription>
                  Change the status of this quotation request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={setNewStatus} defaultValue={request.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add any internal notes about this status change"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>
                  Update Status
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>Respond</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Respond to Quotation Request</DialogTitle>
                <DialogDescription>
                  Create an estimate or quotation in response to this request
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Request: {request.transactionNumber}</h3>
                  <p className="text-sm text-neutral-500">Choose how you want to respond:</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/sales/estimates/new?requestId=${request.id}&type=quotation`)}
                  >
                    Create Quotation
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/sales/estimates/new?requestId=${request.id}&type=estimate`)}
                  >
                    Create Estimate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <Button 
              variant="destructive" 
              onClick={() => setCancelDialogOpen(true)} 
              disabled={request.status === 'cancelled' || request.status === 'closed'}
            >
              Cancel Request
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Quotation Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this quotation request? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelRequest}>
                  Yes, Cancel Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Request ID</h3>
                  <p className="flex items-center gap-2 mt-1">
                    <ClipboardIcon className="h-4 w-4 text-neutral-400" />
                    {request.transactionNumber}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Date</h3>
                  <p className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4 text-neutral-400" />
                    {formatDate(request.transactionDate)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Estimated Amount</h3>
                  <p className="font-mono text-lg mt-1">
                    {formatCurrency(Number(request.amount))}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Response Due Date</h3>
                  <p className="flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4 text-neutral-400" />
                    {request.dueDate ? formatDate(request.dueDate) : "Not specified"}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Reference</h3>
                <p className="flex items-center gap-2 mt-1">
                  <TagIcon className="h-4 w-4 text-neutral-400" />
                  {request.reference || "No reference provided"}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-neutral-500">Request Details</h3>
                <div className="mt-2 p-4 bg-neutral-50 rounded-md whitespace-pre-wrap">
                  {request.notes || "No details provided"}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Response History</CardTitle>
              <CardDescription>Estimates and quotations created from this request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-neutral-500 py-6">
                No responses created yet
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate(`/sales/estimates/new?requestId=${request.id}`)}>
                Create Response
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {customerLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ) : customer ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{customer.name}</h3>
                    <p className="text-sm text-neutral-500 flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      {customer.contactPerson || "No contact person"}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-xs text-neutral-500">Email</h4>
                      <p className="text-sm">{customer.email || "No email provided"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-neutral-500">Phone</h4>
                      <p className="text-sm">{customer.phone || "No phone provided"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-neutral-500">GSTIN</h4>
                      <p className="text-sm">{customer.gstin || "No GSTIN provided"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-xs text-neutral-500">Address</h4>
                    <p className="text-sm whitespace-pre-line">
                      {[
                        customer.address,
                        customer.city,
                        customer.state,
                        customer.pincode
                      ].filter(Boolean).join(", ") || "No address provided"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-6">
                  Customer information not available
                </div>
              )}
            </CardContent>
            {customer && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/sales/parties/${customer.id}`)}
                >
                  View Customer Profile
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-neutral-200"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Request Created</p>
                    <time className="text-xs text-neutral-500">
                      {formatDate(request.createdAt)}
                    </time>
                  </div>
                </div>
                
                {request.status !== 'open' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-0.5 h-full bg-neutral-200"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status Changed</p>
                      <p className="text-xs">Status set to {getStatusLabel(request.status)}</p>
                      <time className="text-xs text-neutral-500">
                        {/* Note: This would ideally come from a status history log */}
                        {formatDate(new Date())}
                      </time>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotationRequestDetail;