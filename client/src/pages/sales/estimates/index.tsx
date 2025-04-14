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

const Estimates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch estimates and quotations
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { types: ['estimate', 'quotation'] }],
  });
  
  // Filter by search term, transaction type and status
  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = 
      tx.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = activeTab === 'all' || 
      (activeTab === 'estimates' && tx.transactionType === 'estimate') ||
      (activeTab === 'quotations' && tx.transactionType === 'quotation');
    
    return matchesSearch && matchesType;
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
          <h1 className="text-2xl font-semibold text-neutral-800">Estimates & Quotations</h1>
          <p className="text-sm text-neutral-500">Manage your estimates and quotations for customers</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <Input 
            className="max-w-[300px]" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New</DialogTitle>
                <DialogDescription>
                  Choose the type of document you want to create
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Link href="/sales/estimates/new?type=estimate">
                  <Button className="w-full" variant="outline">
                    Create Estimate
                  </Button>
                </Link>
                <Link href="/sales/estimates/new?type=quotation">
                  <Button className="w-full">
                    Create Quotation
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Estimates & Quotations</CardTitle>
          <CardDescription>View and manage your estimates and quotations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="estimates">Estimates</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                        <TableCell>{getTransactionTypeLabel(transaction.transactionType)}</TableCell>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell>
                          {transaction.partyId === 1 ? "GlobalTech Solutions" :
                           transaction.partyId === 3 ? "Sundar Innovations" :
                           transaction.partyId === 5 ? "Patel Enterprises" : "Customer"}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/sales/estimates/${transaction.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            
                            {transaction.status !== 'cancelled' && transaction.status !== 'rejected' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">Actions</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Available Actions</DialogTitle>
                                    <DialogDescription>
                                      Choose what you want to do with this {transaction.transactionType}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <h3 className="font-medium">{transaction.transactionNumber}</h3>
                                      <p className="text-sm text-neutral-500">Select an action:</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                      <Link href={`/sales/orders/new?fromId=${transaction.id}`}>
                                        <Button className="w-full" variant="outline">
                                          Convert to Sales Order
                                        </Button>
                                      </Link>
                                      <Link href={`/sales/estimates/${transaction.id}/edit`}>
                                        <Button className="w-full" variant="outline">
                                          Edit
                                        </Button>
                                      </Link>
                                      <Link href={`/sales/estimates/${transaction.id}/print`}>
                                        <Button className="w-full" variant="outline">
                                          Print / Download
                                        </Button>
                                      </Link>
                                      <Link href={`/sales/estimates/${transaction.id}/email`}>
                                        <Button className="w-full">
                                          Email to Customer
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
                  No estimates or quotations found matching your search criteria.
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estimates;