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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getStatusLabel
} from '@/lib/utils';
import { 
  ChevronDownIcon, 
  FilterIcon, 
  BellIcon, 
  XIcon, 
  CheckIcon, 
  Clock3Icon, 
  TruckIcon,
  CreditCardIcon,
  ArchiveIcon
} from 'lucide-react';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  
  // Fetch sales invoices
  const { data: invoices, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'sales_invoice' }],
  });
  
  // Filter by search term and status
  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = 
      invoice.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'unpaid' && (invoice.status === 'pending' || invoice.status === 'partially_paid' || invoice.status === 'overdue')) ||
      (activeTab === 'paid' && invoice.status === 'paid') ||
      (activeTab === 'overdue' && invoice.status === 'overdue');
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate total unpaid and overdue amounts
  const totalUnpaid = filteredInvoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);
  
  const totalOverdue = filteredInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Check if invoice is overdue
  const isOverdue = (invoice: Transaction) => {
    if (!invoice.dueDate) return false;
    const dueDate = new Date(invoice.dueDate);
    return dueDate < new Date() && invoice.status !== 'paid';
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Sales Invoices</h1>
          <p className="text-sm text-neutral-500">Manage your sales invoices and payments</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <Input 
            className="max-w-[300px]" 
            placeholder="Search invoices..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/sales/invoices/new">
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Invoice
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  filteredInvoices.length
                )}
              </div>
              <div className="text-xl font-mono">
                {isLoading ? (
                  <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-amber-600">
                {isLoading ? (
                  <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  filteredInvoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').length
                )}
              </div>
              <div className="text-xl font-mono text-amber-600">
                {isLoading ? (
                  <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(totalUnpaid)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-1">
              <BellIcon className="h-4 w-4 text-red-600" />
              <span>Overdue Amount</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? (
                  <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  filteredInvoices.filter(inv => inv.status === 'overdue').length
                )}
              </div>
              <div className="text-xl font-mono text-red-600">
                {isLoading ? (
                  <div className="h-6 w-24 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(totalOverdue)
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>View and manage your sales invoices</CardDescription>
          </div>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>Last Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Invoices</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <span>Export</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Print Invoice List</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : filteredInvoices.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left side - Transaction List (1/3 width when a transaction is selected) */}
                  <div className={`${selectedInvoice ? "md:w-1/3" : "w-full"}`}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className={selectedInvoice ? "hidden md:table-cell" : ""}>Due Date</TableHead>
                          <TableHead className={selectedInvoice ? "hidden md:table-cell" : ""}>Customer</TableHead>
                          <TableHead className={selectedInvoice ? "hidden md:table-cell" : ""}>Amount</TableHead>
                          <TableHead className={selectedInvoice ? "hidden md:table-cell" : ""}>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow 
                            key={invoice.id} 
                            className={`cursor-pointer ${isOverdue(invoice) ? "bg-red-50" : ""} ${selectedInvoice?.id === invoice.id ? "bg-blue-50" : ""}`}
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <TableCell className="font-medium">{invoice.transactionNumber}</TableCell>
                            <TableCell>{formatDate(invoice.transactionDate)}</TableCell>
                            <TableCell className={selectedInvoice ? "hidden md:table-cell" : ""}>
                              {invoice.dueDate ? (
                                <span className={isOverdue(invoice) ? "text-red-600 font-medium" : ""}>
                                  {formatDate(invoice.dueDate)}
                                </span>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell className={selectedInvoice ? "hidden md:table-cell" : ""}>
                              {invoice.partyId === 1 ? "GlobalTech Solutions" :
                              invoice.partyId === 3 ? "Sundar Innovations" :
                              invoice.partyId === 5 ? "Patel Enterprises" : "Customer"}
                            </TableCell>
                            <TableCell className={selectedInvoice ? "hidden md:table-cell" : ""}>
                              {formatCurrency(Number(invoice.amount))}
                            </TableCell>
                            <TableCell className={selectedInvoice ? "hidden md:table-cell" : ""}>
                              <StatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant={selectedInvoice?.id === invoice.id ? "default" : "outline"} 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedInvoice(invoice);
                                  }}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Right side - Transaction Details (2/3 width) */}
                  {selectedInvoice && (
                    <div className="md:w-2/3 bg-white rounded-md border">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Invoice Details</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedInvoice(null)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Transaction Flow Diagram */}
                      <div className="p-4 border-b">
                        <h4 className="text-sm font-medium mb-3">Transaction Status Flow</h4>
                        <div className="relative">
                          {/* Progress line */}
                          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200"></div>
                          
                          {/* Status Steps */}
                          <div className="relative flex justify-between">
                            {/* Draft */}
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center z-10 
                                ${selectedInvoice.status === 'draft' ? 'bg-blue-500 text-white' : 
                                  ['pending', 'partially_paid', 'paid', 'completed'].includes(selectedInvoice.status || '') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <CheckIcon className="h-4 w-4" />
                              </div>
                              <span className="text-xs mt-1">Draft</span>
                            </div>
                            
                            {/* Pending */}
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center z-10 
                                ${selectedInvoice.status === 'pending' ? 'bg-blue-500 text-white' : 
                                  ['partially_paid', 'paid', 'completed'].includes(selectedInvoice.status || '') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <Clock3Icon className="h-4 w-4" />
                              </div>
                              <span className="text-xs mt-1">Pending</span>
                            </div>
                            
                            {/* Partially Paid */}
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center z-10 
                                ${selectedInvoice.status === 'partially_paid' ? 'bg-blue-500 text-white' : 
                                  ['paid', 'completed'].includes(selectedInvoice.status || '') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <CreditCardIcon className="h-4 w-4" />
                              </div>
                              <span className="text-xs mt-1">Partially Paid</span>
                            </div>
                            
                            {/* Paid */}
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center z-10 
                                ${selectedInvoice.status === 'paid' ? 'bg-blue-500 text-white' : 
                                  ['completed'].includes(selectedInvoice.status || '') ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <CheckIcon className="h-4 w-4" />
                              </div>
                              <span className="text-xs mt-1">Paid</span>
                            </div>
                            
                            {/* Completed */}
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full w-8 h-8 flex items-center justify-center z-10 
                                ${selectedInvoice.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                <ArchiveIcon className="h-4 w-4" />
                              </div>
                              <span className="text-xs mt-1">Completed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Invoice Information */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Basic Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Invoice Number:</span>
                              <span className="text-sm font-medium">{selectedInvoice.transactionNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Date:</span>
                              <span className="text-sm">{formatDate(selectedInvoice.transactionDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Due Date:</span>
                              <span className={`text-sm ${isOverdue(selectedInvoice) ? "text-red-600 font-medium" : ""}`}>
                                {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Status:</span>
                              <StatusBadge status={selectedInvoice.status} />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Customer & Financial Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Customer:</span>
                              <span className="text-sm font-medium">
                                {selectedInvoice.partyId === 1 ? "GlobalTech Solutions" :
                                 selectedInvoice.partyId === 3 ? "Sundar Innovations" :
                                 selectedInvoice.partyId === 5 ? "Patel Enterprises" : "Customer"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Total Amount:</span>
                              <span className="text-sm font-mono">{formatCurrency(Number(selectedInvoice.amount))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Balance Due:</span>
                              <span className={`text-sm font-mono ${selectedInvoice.balanceDue && Number(selectedInvoice.balanceDue) > 0 ? "text-red-600 font-medium" : ""}`}>
                                {selectedInvoice.balanceDue ? formatCurrency(Number(selectedInvoice.balanceDue)) : formatCurrency(0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Payment Method:</span>
                              <span className="text-sm">{selectedInvoice.paymentMethod || "Not specified"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes and References */}
                      <div className="p-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Notes & References</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-500">Reference:</span>
                            <p className="text-sm mt-1">{selectedInvoice.reference || "No reference provided"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Notes:</span>
                            <p className="text-sm mt-1">{selectedInvoice.notes || "No notes provided"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="p-4 border-t flex justify-end space-x-2">
                        <Link href={`/sales/invoices/${selectedInvoice.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                          <Link href={`/sales/receipts/new?invoiceId=${selectedInvoice.id}`}>
                            <Button size="sm">Record Payment</Button>
                          </Link>
                        )}
                        <Link href={`/sales/invoices/${selectedInvoice.id}/print`}>
                          <Button variant="outline" size="sm">Print</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-500">
                  No invoices found matching your search criteria.
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;