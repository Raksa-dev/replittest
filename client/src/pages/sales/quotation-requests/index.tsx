import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getTransactionTypeLabel,
  getStatusLabel
} from '@/lib/utils';

const QuotationRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('open');
  
  // Fetch quotation requests
  const { data: quotationRequests, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'quotation_request' }],
  });
  
  // Filter by search term and status
  const filteredRequests = quotationRequests?.filter(req => {
    const matchesSearch = 
      req.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.notes && req.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'open' && (req.status === 'open' || req.status === 'pending')) ||
      (activeTab === 'responded' && req.status === 'responded') ||
      (activeTab === 'closed' && (req.status === 'closed' || req.status === 'cancelled'));
    
    return matchesSearch && matchesStatus;
  }) || [];

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Quotation Requests</h1>
          <p className="text-sm text-neutral-500">Manage your quotation requests from customers</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <Input 
            className="max-w-[300px]" 
            placeholder="Search requests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/sales/quotation-requests/new">
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Request
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Quotation Requests</CardTitle>
          <CardDescription>View and respond to quotation requests from customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : filteredRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.transactionNumber}</TableCell>
                        <TableCell>{formatDate(request.transactionDate)}</TableCell>
                        <TableCell>
                          {request.partyId === 1 ? "GlobalTech Solutions" :
                           request.partyId === 3 ? "Sundar Innovations" :
                           request.partyId === 5 ? "Patel Enterprises" : "Customer"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/sales/quotation-requests/${request.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            
                            {(request.status === 'open' || request.status === 'pending') && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">Respond</Button>
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
                                      <Link href={`/sales/estimates/new?requestId=${request.id}&type=quotation`}>
                                        <Button className="w-full" variant="outline">
                                          Create Quotation
                                        </Button>
                                      </Link>
                                      <Link href={`/sales/estimates/new?requestId=${request.id}&type=estimate`}>
                                        <Button className="w-full">
                                          Create Estimate
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-neutral-500">
                  No quotation requests found matching your search criteria.
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationRequests;