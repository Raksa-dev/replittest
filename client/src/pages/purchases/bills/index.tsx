import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeftIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Party, Transaction } from '@shared/schema';
import TransactionDetailView, { StatusBadge } from '@/components/TransactionDetailView';

const PurchaseBills = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  
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

  // Get selected transaction data
  const selectedBill = bills?.find(bill => bill.id === selectedTransaction);

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string | Date) => {
    if (!dueDate) return 0;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Apply filters
  const filteredBills = bills?.filter(bill => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      bill.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.reference && bill.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vendors?.find(v => v.id === bill.partyId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid') {
        matchesStatus = Number(bill.balanceDue || 0) === 0;
      } else if (statusFilter === 'unpaid') {
        matchesStatus = Number(bill.balanceDue || 0) > 0;
      } else if (statusFilter === 'overdue') {
        matchesStatus = bill.dueDate ? getDaysOverdue(bill.dueDate) > 0 : false;
      } else {
        matchesStatus = bill.status === statusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/purchases">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Purchases
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
      
      <div className={`flex flex-col ${selectedTransaction ? 'md:flex-row' : ''} gap-6`}>
        {/* Bills list */}
        <Card className={selectedTransaction ? 'md:w-1/3' : 'w-full'}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bill List</CardTitle>
              <Button asChild>
                <Link href="/purchases/bills/new">Create New Bill</Link>
              </Button>
            </div>
            <CardDescription>Manage your purchase bills and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {billsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-neutral-100 rounded-md"></div>
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                ))}
              </div>
            ) : filteredBills && filteredBills.length > 0 ? (
              <div className="space-y-2">
                {filteredBills.map((bill) => {
                  const vendor = vendors?.find(v => v.id === bill.partyId);
                  const daysOverdue = bill.dueDate ? getDaysOverdue(bill.dueDate) : 0;
                  
                  return (
                    <div 
                      key={bill.id} 
                      className={`p-3 border rounded-md cursor-pointer hover:bg-neutral-50 transition-all ${selectedTransaction === bill.id ? 'border-primary bg-neutral-50' : ''}`}
                      onClick={() => setSelectedTransaction(bill.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="font-medium">{bill.transactionNumber}</div>
                          <div className="text-sm text-neutral-500">
                            {vendor ? vendor.name : 'Unknown Vendor'}
                          </div>
                        </div>
                        <StatusBadge 
                          status={bill.status} 
                          dueDate={bill.dueDate} 
                          balanceDue={bill.balanceDue} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <div className="text-neutral-500">
                          {formatDate(bill.transactionDate)}
                        </div>
                        <div className="font-mono font-medium">
                          {formatCurrency(Number(bill.amount))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No bills found. Try changing your filters or create a new bill.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Transaction detail view */}
        {selectedTransaction && selectedBill && (
          <TransactionDetailView
            transaction={selectedBill}
            parties={vendors}
            onClose={() => setSelectedTransaction(null)}
            transactionTitle="Bill"
            partyType="vendor"
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseBills;