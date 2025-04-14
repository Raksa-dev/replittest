import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { MailIcon, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Party, Transaction } from '@shared/schema';

interface VendorDetailProps {
  id: string;
}

interface VendorWithDetails extends Party {
  totalPayable: number;
  lastPaymentDate: string | null;
}

interface AgeingBucket {
  range: string;
  amount: number;
  percentage: number;
}

const VendorDetail = ({ id }: VendorDetailProps) => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('unpaid');
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  // Fetch vendor details
  const { data: vendor, isLoading: isVendorLoading } = useQuery<VendorWithDetails>({
    queryKey: ['/api/finance/payables/vendors', id],
  });
  
  // Fetch vendor transactions
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/finance/payables/transactions', { vendorId: id, status: activeTab === 'unpaid' ? 'unpaid' : 'all' }],
  });
  
  // Fetch ageing analysis
  const { data: ageing, isLoading: isAgeingLoading } = useQuery<AgeingBucket[]>({
    queryKey: ['/api/finance/payables/ageing', { vendorId: id }],
  });
  
  // Fetch unallocated payments
  const { data: unallocatedPayments, isLoading: isPaymentsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/finance/payables/payments/unallocated', { vendorId: id }],
    enabled: activeTab === 'unallocated',
  });
  
  // Filter transactions based on period
  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    if (filterPeriod === 'all') return transactions;
    
    const now = new Date();
    const periods = {
      '30days': 30,
      '90days': 90,
      '180days': 180,
      '365days': 365,
    };
    
    const daysToSubtract = periods[filterPeriod as keyof typeof periods] || 0;
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    
    return transactions.filter(transaction => 
      new Date(transaction.transactionDate) >= cutoffDate
    );
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2"
          onClick={() => navigate('/finance/payables/vendors')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
        
        {isVendorLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-100 rounded w-1/3"></div>
            <div className="h-4 bg-neutral-100 rounded w-1/4"></div>
          </div>
        ) : vendor ? (
          <>
            <h1 className="text-2xl font-semibold">{vendor.name}</h1>
            <div className="flex flex-wrap gap-x-4 text-sm text-neutral-500">
              {vendor.gstin && <span>GSTIN: {vendor.gstin}</span>}
              {vendor.phone && <span>Phone: {vendor.phone}</span>}
              {vendor.email && <span>Email: {vendor.email}</span>}
            </div>
          </>
        ) : (
          <div className="text-lg font-medium">Vendor not found</div>
        )}
      </div>
      
      {/* Vendor Financial Summary */}
      {isVendorLoading ? (
        <div className="animate-pulse space-y-4 mb-6">
          <div className="h-40 bg-neutral-100 rounded"></div>
        </div>
      ) : vendor ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Total Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(vendor.totalPayable)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Last Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {vendor.lastPaymentDate 
                  ? formatDate(vendor.lastPaymentDate)
                  : <span className="text-neutral-400">No payments</span>
                }
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
      
      {/* Ageing Analysis */}
      {isAgeingLoading ? (
        <div className="animate-pulse space-y-4 mb-6">
          <div className="h-60 bg-neutral-100 rounded"></div>
        </div>
      ) : ageing ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ageing Analysis</CardTitle>
            <CardDescription>Payables breakdown by age</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ageing.map((bucket, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{bucket.range}</span>
                    <span className="text-sm font-medium">{formatCurrency(bucket.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={bucket.percentage} 
                      className="h-2"
                    />
                    <span className="text-xs text-neutral-500 w-12 text-right">
                      {bucket.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Link href="/finance/payables/aging-analysis">
              <Button variant="outline" size="sm">
                View Full Ageing Analysis
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : null}
      
      {/* Tabs for different transaction views */}
      <Tabs defaultValue="unpaid" className="mb-6" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="unpaid">Unpaid Bills</TabsTrigger>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="unallocated">Unallocated Payments</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select 
              value={filterPeriod} 
              onValueChange={setFilterPeriod}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="180days">Last 180 Days</SelectItem>
                <SelectItem value="365days">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Link href={`/finance/payables/payments/new?vendorId=${id}`}>
                <Button size="sm">
                  Make Payment
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <TabsContent value="unpaid">
          {isTransactionsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-neutral-100 rounded-md"></div>
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Balance Payable</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const dueDate = transaction.dueDate ? new Date(transaction.dueDate) : null;
                      const today = new Date();
                      const daysOverdue = dueDate 
                        ? Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
                        : 0;
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Link href={`/finance/payables/bills/${transaction.id}`}>
                              <span className="font-medium cursor-pointer hover:text-blue-600">
                                {transaction.transactionNumber}
                              </span>
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(Number(transaction.amount))}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(Number(transaction.balanceDue || 0))}
                          </TableCell>
                          <TableCell>{dueDate ? formatDate(dueDate) : '-'}</TableCell>
                          <TableCell>
                            {daysOverdue > 0 ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                daysOverdue > 60 ? 'bg-red-100 text-red-800' :
                                daysOverdue > 30 ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {daysOverdue} days
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Not due
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <MailIcon className="h-4 w-4 mr-1" />
                                Follow Up
                              </Button>
                              <Link href={`/finance/payables/payments/new?billId=${transaction.id}`}>
                                <Button size="sm">
                                  Make Payment
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No Unpaid Bills</h3>
                <p className="text-neutral-500 mb-4">
                  This vendor has no outstanding bills for the selected period.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {isTransactionsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-neutral-100 rounded-md"></div>
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Link href={`/finance/transactions/${transaction.id}`}>
                            <span className="font-medium cursor-pointer hover:text-blue-600">
                              {transaction.transactionNumber}
                            </span>
                          </Link>
                          {transaction.reference && (
                            <div className="text-xs text-neutral-500">
                              Ref: {transaction.reference}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.transactionType === 'purchase_invoice' ? 'Bill' :
                           transaction.transactionType === 'payment' ? 'Payment' :
                           transaction.transactionType === 'credit_note' ? 'Credit Note' :
                           transaction.transactionType === 'purchase_order' ? 'Purchase Order' :
                           transaction.transactionType === 'grn' ? 'GRN' : 
                           transaction.transactionType}
                        </TableCell>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={transaction.transactionType === 'payment' ? 'text-red-600' : ''}>
                            {formatCurrency(Number(transaction.amount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'paid' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'partially_paid' ? 'bg-blue-100 text-blue-800' :
                            transaction.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {transaction.status === 'partially_paid' ? 'Partially Paid' :
                             transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/finance/transactions/${transaction.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-1">No Transactions Found</h3>
                <p className="text-neutral-500 mb-4">
                  There are no transactions with this vendor for the selected period.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="unallocated">
          {isPaymentsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-neutral-100 rounded-md"></div>
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : unallocatedPayments && unallocatedPayments.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unallocatedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.transactionNumber}
                        </TableCell>
                        <TableCell>{formatDate(payment.transactionDate)}</TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>
                          <Link href={`/finance/payables/payments/${payment.id}/allocate`}>
                            <Button size="sm">
                              Allocate Payment
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No Unallocated Payments</h3>
                <p className="text-neutral-500 mb-4">
                  All payments have been allocated to bills.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDetail;