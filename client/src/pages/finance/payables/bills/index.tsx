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
  CreditCard,
  Banknote,
  Download 
} from "lucide-react";
import { Party, Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  getStatusLabel
} from '@/lib/utils';

const PayablesBills = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch purchase bills
  const { data: bills, isLoading: billsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { 
      type: 'purchase_bill'
    }],
  });
  
  // Fetch vendors
  const { data: vendors } = useQuery<Party[]>({
    queryKey: ['/api/parties', { type: 'vendor' }],
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

  // Filter bills
  const filteredBills = bills?.filter(bill => {
    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && Number(bill.balanceDue || 0) <= 0) {
        return true;
      } else if (statusFilter === 'unpaid' && Number(bill.balanceDue || 0) > 0) {
        return true;
      } else if (statusFilter === 'overdue' && bill.dueDate && getDaysOverdue(bill.dueDate) > 0) {
        return true;
      } else if (statusFilter === bill.status) {
        return true;
      } else {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const vendor = vendors?.find(v => v.id === bill.partyId);
      const vendorName = vendor?.name?.toLowerCase() || '';
      
      return (
        bill.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendorName.includes(searchTerm.toLowerCase()) ||
        (bill.reference && bill.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bill.vendorBillNumber && bill.vendorBillNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return true;
  });

  // Status badge component
  const StatusBadge = ({ status, dueDate, balanceDue }: { status: string, dueDate?: string | Date, balanceDue?: number | string | null }) => {
    // Override status badge for overdue bills
    if (dueDate && balanceDue && Number(balanceDue) > 0 && getDaysOverdue(dueDate) > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    
    // Show paid for zero balance bills
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
            <h1 className="text-2xl font-semibold text-neutral-800">Purchase Bills</h1>
            <p className="text-sm text-neutral-500">View and manage all vendor bills</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search bills..." 
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
          <CardTitle>Bill List</CardTitle>
          <CardDescription>Manage your purchase bills and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {billsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-neutral-100 rounded-md"></div>
              {Array(10).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : filteredBills && filteredBills.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Vendor Bill No.</TableHead>
                  <TableHead>Vendor</TableHead>
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
                {filteredBills.map((bill) => {
                  const vendor = vendors?.find(v => v.id === bill.partyId);
                  const daysOverdue = bill.dueDate ? getDaysOverdue(bill.dueDate) : 0;
                  
                  return (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        <Link href={`/finance/transactions/${bill.id}`}>
                          <span className="cursor-pointer hover:text-primary">
                            {bill.transactionNumber}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{bill.vendorBillNumber || '-'}</TableCell>
                      <TableCell>
                        {vendor ? (
                          <Link href={`/finance/payables/vendors/${vendor.id}`}>
                            <span className="cursor-pointer hover:text-primary">
                              {vendor.name}
                            </span>
                          </Link>
                        ) : 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDate(bill.transactionDate)}</TableCell>
                      <TableCell>
                        {bill.dueDate ? formatDate(bill.dueDate) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatCurrency(Number(bill.amount))}</TableCell>
                      <TableCell>
                        {Number(bill.balanceDue || 0) > 0 ? (
                          <span className="font-semibold text-red-600">
                            {formatCurrency(Number(bill.balanceDue))}
                          </span>
                        ) : (
                          <span className="font-semibold text-green-600">Paid</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={bill.status} 
                          dueDate={bill.dueDate} 
                          balanceDue={bill.balanceDue} 
                        />
                      </TableCell>
                      <TableCell>
                        {bill.dueDate && Number(bill.balanceDue || 0) > 0 ? (
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
                            <Link href={`/finance/transactions/${bill.id}`}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="px-2">
                            <Download className="h-4 w-4" />
                          </Button>
                          {Number(bill.balanceDue || 0) > 0 && (
                            <>
                              <Button variant="outline" size="sm" asChild className="px-2">
                                <Link href={`/finance/payables/make-payment?billId=${bill.id}`}>
                                  <CreditCard className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" asChild>
                                <Link href={`/finance/payables/record-payment?billId=${bill.id}`}>
                                  <Banknote className="h-4 w-4 mr-1" />
                                  Record Payment
                                </Link>
                              </Button>
                            </>
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
              <p className="text-neutral-500">No bills found matching your criteria.</p>
              <Button className="mt-4" asChild>
                <Link href="/purchases/bills/new">Create New Bill</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayablesBills;