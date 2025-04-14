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
import { Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getTransactionTypeLabel,
  getStatusLabel
} from '@/lib/utils';

const Purchases = () => {
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
  
  // Fetch purchase transactions of all types for the overview
  const { data: allPurchaseTransactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { 
      types: [
        'purchase_bill', 
        'purchase_order', 
        'purchase_quotation_request', 
        'purchase_quotation', 
        'credit_note', 
        'payment',
        'grn'
      ]
    }],
    enabled: activeTab === 'all',
  });
  
  // Transform data into grouped categories
  const groupedTransactions = {
    bills: allPurchaseTransactions?.filter(t => t.transactionType === 'purchase_bill') || [],
    orders: allPurchaseTransactions?.filter(t => t.transactionType === 'purchase_order') || [],
    quotationRequests: allPurchaseTransactions?.filter(t => t.transactionType === 'purchase_quotation_request') || [],
    quotations: allPurchaseTransactions?.filter(t => t.transactionType === 'purchase_quotation') || [],
    grns: allPurchaseTransactions?.filter(t => t.transactionType === 'grn') || [],
    creditNotes: allPurchaseTransactions?.filter(t => t.transactionType === 'credit_note') || [],
    payments: allPurchaseTransactions?.filter(t => t.transactionType === 'payment') || [],
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
                      transaction.partyId === 5 ? "Patel Enterprises" : "Vendor"}
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
      case 'bill':
        setLocation('/purchases/bills/new');
        break;
      case 'order':
        setLocation('/purchases/orders/new');
        break;
      case 'quotation_request':
        setLocation('/purchases/quotation-requests/new');
        break;
      case 'payment':
        setLocation('/purchases/payments/new');
        break;
      case 'credit_note':
        setLocation('/purchases/returns/new');
        break;
      default:
        setLocation('/purchases/bills/new');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Purchases</h1>
          <p className="text-sm text-neutral-500">Manage your purchase transactions</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">Import from Tally</Button>
          
          {/* Dropdown Component */}
          <div className="relative" ref={dropdownRef}>
            <Button onClick={() => setDropdownOpen(!dropdownOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Purchase
            </Button>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('bill');
                      setDropdownOpen(false);
                    }}
                  >
                    New Bill
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('order');
                      setDropdownOpen(false);
                    }}
                  >
                    New Purchase Order
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('quotation_request');
                      setDropdownOpen(false);
                    }}
                  >
                    New Quotation Request
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('payment');
                      setDropdownOpen(false);
                    }}
                  >
                    New Payment
                  </button>
                  <button 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                    onClick={() => {
                      handleAddNew('credit_note');
                      setDropdownOpen(false);
                    }}
                  >
                    New Credit Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Purchases Overview</CardTitle>
          <CardDescription>View and manage all your purchase transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="quotations-requests">Quotations & Requests</TabsTrigger>
              <TabsTrigger value="orders-grn">Orders & GRN</TabsTrigger>
              <TabsTrigger value="bills-payments">Bills & Payments</TabsTrigger>
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
                    route="/purchases/quotation-requests"
                  />
                  
                  <TransactionCard
                    title="Vendor Quotations"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    transactions={groupedTransactions.quotations}
                    route="/purchases/quotations"
                  />
                  
                  <TransactionCard
                    title="Purchase Orders"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                    transactions={groupedTransactions.orders}
                    route="/purchases/orders"
                  />
                  
                  <TransactionCard
                    title="Goods Receipt Notes"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                    transactions={groupedTransactions.grns}
                    route="/purchases/grn"
                  />
                  
                  <TransactionCard
                    title="Purchase Bills"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    transactions={groupedTransactions.bills}
                    route="/purchases/bills"
                  />
                  
                  <TransactionCard
                    title="Credit Notes"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>}
                    transactions={groupedTransactions.creditNotes}
                    route="/purchases/returns"
                  />
                  
                  <TransactionCard
                    title="Payments Made"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    transactions={groupedTransactions.payments}
                    route="/purchases/payments"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="quotations-requests">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quotation Requests</CardTitle>
                    <CardDescription>Manage quotation requests sent to vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/quotation-requests">
                      <Button className="w-full">View Quotation Requests</Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vendor Quotations</CardTitle>
                    <CardDescription>Manage quotations received from vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/quotations">
                      <Button className="w-full">View Vendor Quotations</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="orders-grn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase Orders</CardTitle>
                    <CardDescription>Manage purchase orders sent to vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/orders">
                      <Button className="w-full">View Purchase Orders</Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Goods Receipt Notes</CardTitle>
                    <CardDescription>Manage goods received from vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/grn">
                      <Button className="w-full">View GRN</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="bills-payments">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase Bills</CardTitle>
                    <CardDescription>Manage bills received from vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/bills">
                      <Button className="w-full">View Purchase Bills</Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Notes</CardTitle>
                    <CardDescription>Manage purchase returns and credits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/returns">
                      <Button className="w-full">View Credit Notes</Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Payments</CardTitle>
                    <CardDescription>Manage payments made to vendors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/purchases/payments">
                      <Button className="w-full">View Payments</Button>
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
          <CardDescription>Your latest purchase activities</CardDescription>
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
          ) : allPurchaseTransactions && allPurchaseTransactions.length > 0 ? (
            <div className="space-y-4">
              {allPurchaseTransactions.slice(0, 5).map(transaction => (
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
                         transaction.partyId === 5 ? "Patel Enterprises" : "Vendor"}
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
              No recent purchase activities found. Create a new purchase or sync with Tally.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchases;