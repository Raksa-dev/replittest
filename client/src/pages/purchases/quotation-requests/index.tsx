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

const PurchaseQuotationRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('sent');
  
  // Fetch purchase quotation requests
  const { data: quotationRequests, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'purchase_quotation_request' }],
  });
  
  // Fetch received quotations from vendors
  const { data: vendorQuotations, isLoading: quotationsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'purchase_quotation' }],
    enabled: activeTab === 'received',
  });
  
  // Filter by search term and status for requests
  const filteredRequests = quotationRequests?.filter(req => {
    const matchesSearch = 
      req.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.notes && req.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  }) || [];

  // Filter by search term for received quotations
  const filteredQuotations = vendorQuotations?.filter(quot => {
    const matchesSearch = 
      quot.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quot.notes && quot.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
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
          <h1 className="text-2xl font-semibold text-neutral-800">Quotation Requests & Quotes</h1>
          <p className="text-sm text-neutral-500">Send quotation requests to vendors and track received quotations</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <Input 
            className="max-w-[300px]" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/purchases/quotation-requests/new">
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
          <CardTitle>Quotations Management</CardTitle>
          <CardDescription>Manage quotation requests sent to vendors and received quotations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sent" onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="sent">Sent Requests</TabsTrigger>
              <TabsTrigger value="received">Received Quotations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sent">
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
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
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
                           request.partyId === 5 ? "Patel Enterprises" : "Vendor"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>{request.reference || "—"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/purchases/quotation-requests/${request.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            
                            {request.status === 'sent' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">Record Response</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Record Vendor Response</DialogTitle>
                                    <DialogDescription>
                                      Record a quotation response received from the vendor
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <h3 className="font-medium">Request: {request.transactionNumber}</h3>
                                      <p className="text-sm text-neutral-500">Record the vendor's response:</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                      <Link href={`/purchases/quotations/new?requestId=${request.id}`}>
                                        <Button className="w-full">
                                          Record Vendor Quotation
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
            </TabsContent>
            
            <TabsContent value="received">
              {quotationsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : filteredQuotations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quotation ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">{quotation.transactionNumber}</TableCell>
                        <TableCell>{formatDate(quotation.transactionDate)}</TableCell>
                        <TableCell>
                          {quotation.partyId === 1 ? "GlobalTech Solutions" :
                           quotation.partyId === 3 ? "Sundar Innovations" :
                           quotation.partyId === 5 ? "Patel Enterprises" : "Vendor"}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(quotation.amount))}</TableCell>
                        <TableCell>
                          {quotation.dueDate ? formatDate(quotation.dueDate) : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/purchases/quotations/${quotation.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/purchases/orders/new?quotationId=${quotation.id}`}>
                              <Button size="sm">Create PO</Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-neutral-500">
                  No vendor quotations found matching your search criteria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseQuotationRequests;