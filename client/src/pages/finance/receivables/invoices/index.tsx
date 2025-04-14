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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeftIcon, 
  FileText, 
  Mail, 
  MessageSquare, 
  Download 
} from "lucide-react";
import { Party, Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  getStatusLabel
} from '@/lib/utils';

const ReceivablesInvoices = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch sales invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { 
      type: 'sales_invoice'
    }],
  });
  
  // Fetch customers
  const { data: customers } = useQuery<Party[]>({
    queryKey: ['/api/parties', { type: 'customer' }],
  });

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string | Date) => {
    if (!dueDate) return 0;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter invoices
  const filteredInvoices = invoices?.filter(invoice => {
    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && Number(invoice.balanceDue || 0) <= 0) {
        return true;
      } else if (statusFilter === 'unpaid' && Number(invoice.balanceDue || 0) > 0) {
        return true;
      } else if (statusFilter === 'overdue' && invoice.dueDate && getDaysOverdue(invoice.dueDate) > 0) {
        return true;
      } else if (statusFilter === invoice.status) {
        return true;
      } else {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const customer = customers?.find(c => c.id === invoice.partyId);
      const customerName = customer?.name?.toLowerCase() || '';
      
      return (
        invoice.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase()) ||
        (invoice.reference && invoice.reference.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return true;
  });

  // Status badge component
  const StatusBadge = ({ status, dueDate, balanceDue }: { status: string, dueDate?: string | Date, balanceDue?: number | string | null }) => {
    // Override status badge for overdue invoices
    if (dueDate && balanceDue && Number(balanceDue) > 0 && getDaysOverdue(dueDate) > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    
    // Show paid for zero balance invoices
    if (balanceDue !== undefined && Number(balanceDue) <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    }
    
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/finance">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Finance
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800">Invoices</h1>
            <p className="text-sm text-neutral-500">View and manage all customer invoices</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-[250px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Manage your sales invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-neutral-100 rounded-md"></div>
              {Array(10).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const customer = customers?.find(c => c.id === invoice.partyId);
                  const daysOverdue = invoice.dueDate ? getDaysOverdue(invoice.dueDate) : 0;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link href={`/finance/transactions/${invoice.id}`}>
                          <span className="cursor-pointer hover:text-primary">
                            {invoice.transactionNumber}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer ? (
                          <Link href={`/finance/receivables/customers/${customer.id}`}>
                            <span className="cursor-pointer hover:text-primary">
                              {customer.name}
                            </span>
                          </Link>
                        ) : 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDate(invoice.transactionDate)}</TableCell>
                      <TableCell>
                        {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(invoice.amount))}</TableCell>
                      <TableCell>
                        {Number(invoice.balanceDue || 0) > 0 ? (
                          <span className="font-semibold text-red-600">
                            {formatCurrency(Number(invoice.balanceDue))}
                          </span>
                        ) : (
                          <span className="font-semibold text-green-600">Paid</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={invoice.status} 
                          dueDate={invoice.dueDate} 
                          balanceDue={invoice.balanceDue} 
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate && Number(invoice.balanceDue || 0) > 0 ? (
                          daysOverdue > 0 ? (
                            <span className="text-red-600 font-medium">{daysOverdue} days</span>
                          ) : (
                            <span className="text-green-600">Not due</span>
                          )
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" asChild className="px-2">
                            <Link href={`/finance/transactions/${invoice.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          {Number(invoice.balanceDue || 0) > 0 && (
                            <>
                              <Button variant="outline" size="sm" className="px-2">
                                <Link href={`/finance/receivables/follow-up/${invoice.id}`}>
                                  <Mail className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="px-2">
                                <Link href={`/finance/receivables/follow-up/${invoice.id}/sms`}>
                                  <MessageSquare className="h-4 w-4" />
                                </Link>
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" className="px-2">
                            <Download className="h-4 w-4" />
                          </Button>
                          {Number(invoice.balanceDue || 0) > 0 && (
                            <Button size="sm" asChild>
                              <Link href={`/finance/receivables/record-receipt?invoiceId=${invoice.id}`}>
                                Record Receipt
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-neutral-500">No invoices found matching your criteria.</p>
              <Button className="mt-4" asChild>
                <Link href="/sales/invoices/new">Create New Invoice</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivablesInvoices;