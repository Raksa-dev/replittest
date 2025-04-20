import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getTransactionTypeLabel,
  getStatusLabel
} from '@/lib/utils';

const Sales = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch sales transactions of all types for the overview
  const { data: allSalesTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { 
      types: [
        'sales_invoice', 
        'sales_order', 
        'estimate', 
        'quotation', 
        'quotation_request', 
        'delivery_note', 
        'debit_note', 
        'receipt'
      ]
    }],
    enabled: activeTab === 'all',
  });

  // Transform data into grouped categories
  const groupedTransactions = {
    invoices: allSalesTransactions?.filter(t => t.transactionType === 'sales_invoice') || [],
    orders: allSalesTransactions?.filter(t => t.transactionType === 'sales_order') || [],
    estimates: allSalesTransactions?.filter(t => t.transactionType === 'estimate') || [],
    quotations: allSalesTransactions?.filter(t => t.transactionType === 'quotation') || [],
    quotationRequests: allSalesTransactions?.filter(t => t.transactionType === 'quotation_request') || [],
    deliveryNotes: allSalesTransactions?.filter(t => t.transactionType === 'delivery_note') || [],
    debitNotes: allSalesTransactions?.filter(t => t.transactionType === 'debit_note') || [],
    receipts: allSalesTransactions?.filter(t => t.transactionType === 'receipt') || [],
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Transaction card for dashboard view
  const TransactionCard = ({
    title,
    icon,
    transactions,
    route,
    buttonLabel = "View All",
    className = ""
  }: {
    title: string;
    icon: React.ReactNode;
    transactions: Transaction[];
    route: string;
    buttonLabel?: string;
    className?: string;
  }) => (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-medium flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <span className="text-sm text-neutral-500 font-medium">{transactions.length} items</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.length > 0 ? (
            <>
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{transaction.transactionNumber}</div>
                    <div className="text-xs text-neutral-500">
                      {transaction.partyId === 1 ? "GlobalTech Solutions" :
                      transaction.partyId === 3 ? "Sundar Innovations" :
                      transaction.partyId === 5 ? "Patel Enterprises" : "Customer"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-mono text-sm">{formatCurrency(Number(transaction.amount))}</div>
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link href={route}>
                  <Button variant="outline" size="sm" className="w-full">
                    {buttonLabel}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-neutral-500 text-sm">
              No {title.toLowerCase()} found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Navigate to a specific section
  const handleAddNew = (type: string) => {
    switch (type) {
      case 'invoice':
        setLocation('/sales/invoices/new');
        break;
      case 'order':
        setLocation('/sales/orders/new');
        break;
      case 'estimate':
        setLocation('/sales/estimates/new');
        break;
      case 'quotation':
        setLocation('/sales/estimates/new?type=quotation');
        break;
      case 'debit_note':
        setLocation('/sales/debit-notes/new');
        break;
      default:
        setLocation('/sales/invoices/new');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Sales</h1>
          <p className="text-sm text-neutral-500">Manage your sales transactions</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">Import from Tally</Button>

          {/* Dropdown Component */}
          <div className="relative" ref={dropdownRef}>
            <Button onClick={() => setDropdownOpen(!dropdownOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Sale
            </Button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('invoice');
                      setDropdownOpen(false);
                    }}
                  >
                    New Invoice
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('order');
                      setDropdownOpen(false);
                    }}
                  >
                    New Order
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('estimate');
                      setDropdownOpen(false);
                    }}
                  >
                    New Estimate
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('debit_note');
                      setDropdownOpen(false);
                    }}
                  >
                    New Debit Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>View and manage all your sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="quotations-requests">Quotations & Requests</TabsTrigger>
              <TabsTrigger value="orders">Orders & Delivery</TabsTrigger>
              <TabsTrigger value="invoices">Invoices & Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {transactionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(null).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Array(3).fill(null).map((_, j) => (
                            <div key={j} className="flex justify-between items-center py-2 border-b last:border-b-0">
                              <div className="w-1/2">
                                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                              </div>
                              <div className="w-1/3">
                                <div className="h-4 bg-neutral-200 rounded w-full mb-1"></div>
                                <div className="h-5 bg-neutral-200 rounded w-2/3 ml-auto"></div>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2">
                            <div className="h-8 bg-neutral-200 rounded w-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TransactionCard
                    title="Quotation Requests"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                    transactions={groupedTransactions.quotationRequests}
                    route="/sales/quotation-requests"
                  />

                  <TransactionCard
                    title="Estimates & Quotations"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    transactions={[...groupedTransactions.estimates, ...groupedTransactions.quotations]}
                    route="/sales/estimates"
                  />

                  <TransactionCard
                    title="Sales Orders"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                    transactions={groupedTransactions.orders}
                    route="/sales/orders"
                  />

                  <TransactionCard
                    title="Delivery Notes"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
                    transactions={groupedTransactions.deliveryNotes}
                    route="/sales/delivery-notes"
                  />

                  <TransactionCard
                    title="Sales Invoices"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    transactions={groupedTransactions.invoices}
                    route="/sales/invoices"
                  />

                  <TransactionCard
                    title="Debit Notes"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>}
                    transactions={groupedTransactions.debitNotes}
                    route="/sales/debit-notes"
                  />

                  <TransactionCard
                    title="Receipts"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    transactions={groupedTransactions.receipts}
                    route="/sales/receipts"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="quotations-requests">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quotation Requests</CardTitle>
                    <CardDescription>Manage quotation requests from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/quotation-requests">
                      <Button className="w-full">View Quotation Requests</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estimates & Quotations</CardTitle>
                    <CardDescription>Manage estimates and quotations sent to customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/estimates">
                      <Button className="w-full">View Estimates & Quotations</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Orders</CardTitle>
                    <CardDescription>Manage sales orders from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/orders">
                      <Button className="w-full">View Sales Orders</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Notes</CardTitle>
                    <CardDescription>Manage goods delivery notes and shipping documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/delivery-notes">
                      <Button className="w-full">View Delivery Notes</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="invoices">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sales Invoices</CardTitle>
                    <CardDescription>Manage invoices issued to customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/invoices">
                      <Button className="w-full">View Sales Invoices</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Debit Notes</CardTitle>
                    <CardDescription>Manage debit notes for sales returns and adjustments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/debit-notes">
                      <Button className="w-full">View Debit Notes</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Receipts</CardTitle>
                    <CardDescription>Manage payments received from customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/sales/receipts">
                      <Button className="w-full">View Receipts</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activities Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest sales activities</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="animate-pulse space-y-4">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="border rounded-md p-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-neutral-200 rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded w-1/3 mb-1"></div>
                  <div className="flex justify-between mt-2">
                    <div className="h-3 bg-neutral-200 rounded w-24"></div>
                    <div className="h-3 bg-neutral-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allSalesTransactions && allSalesTransactions.length > 0 ? (
            <div className="space-y-4">
              {allSalesTransactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="border rounded-md p-4 hover:bg-neutral-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm px-2 py-1 bg-neutral-100 text-neutral-800 rounded mr-2">
                          {getTransactionTypeLabel(transaction.transactionType)}
                        </span>
                        <h3 className="font-medium">{transaction.transactionNumber}</h3>
                        <span className="text-neutral-500 text-sm ml-2">
                          {formatDate(transaction.transactionDate)}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-500 mt-1">
                        {transaction.partyId === 1 ? "GlobalTech Solutions" :
                         transaction.partyId === 3 ? "Sundar Innovations" :
                         transaction.partyId === 5 ? "Patel Enterprises" : "Customer"}
                      </div>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <div className="text-sm">
                      {transaction.reference && (
                        <span className="text-neutral-500">Ref: {transaction.reference}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium font-mono">
                        {formatCurrency(Number(transaction.amount))}
                      </div>
                      {transaction.balanceDue && Number(transaction.balanceDue) > 0 && (
                        <div className="text-xs text-red-600">
                          Due: {formatCurrency(Number(transaction.balanceDue))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No recent sales activities found. Create a new sale or sync with Tally.
            </div>
          )}
        </CardContent>
      </Card>
      <FloatingActionButton onClick={() => console.log('Create new item')}/>
    </div>
  );
};

export default Sales;