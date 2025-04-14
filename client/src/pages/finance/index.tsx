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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Transaction } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch data for summary
  const { data: receivablesData, isLoading: isReceivablesLoading } = useQuery<{ total: number, count: number }>({
    queryKey: ['/api/ageing/receivables/summary'],
    enabled: activeTab === 'overview',
  });
  
  const { data: payablesData, isLoading: isPayablesLoading } = useQuery<{ total: number, count: number }>({
    queryKey: ['/api/ageing/payables/summary'],
    enabled: activeTab === 'overview',
  });
  
  // Fetch recent payments and receipts
  const { data: recentReceipts, isLoading: isReceiptsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'receipt', limit: 5 }],
    enabled: activeTab === 'overview',
  });
  
  const { data: recentPayments, isLoading: isPaymentsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'payment', limit: 5 }],
    enabled: activeTab === 'overview',
  });
  
  // Fetch sync status
  const { data: syncData, isLoading: isSyncLoading } = useQuery({
    queryKey: ['/api/tally-sync/latest'],
    enabled: activeTab === 'overview',
  });
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Finance</h1>
          <p className="text-sm text-neutral-500">Manage receivables, payables and financial transactions</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Sync with Tally
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="bnpl">BNPL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Receivables</CardTitle>
                <CardDescription>Amounts due from customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold">
                      {isReceivablesLoading 
                        ? <div className="h-8 w-32 bg-neutral-100 rounded animate-pulse"></div>
                        : formatCurrency(receivablesData?.total || 0)
                      }
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {isReceivablesLoading 
                        ? <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div>
                        : `${receivablesData?.count || 0} open invoices`
                      }
                    </div>
                  </div>
                  <Link href="/finance/receivables">
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowUpRight className="w-4 h-4 ml-2 text-green-600" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Payables</CardTitle>
                <CardDescription>Amounts due to vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold">
                      {isPayablesLoading 
                        ? <div className="h-8 w-32 bg-neutral-100 rounded animate-pulse"></div>
                        : formatCurrency(payablesData?.total || 0)
                      }
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {isPayablesLoading 
                        ? <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div>
                        : `${payablesData?.count || 0} pending bills`
                      }
                    </div>
                  </div>
                  <Link href="/finance/payables">
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowDownRight className="w-4 h-4 ml-2 text-red-600" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                {isReceiptsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-2 animate-pulse">
                        <div className="h-5 bg-neutral-100 rounded w-3/4 mb-1"></div>
                        <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentReceipts && recentReceipts.length > 0 ? (
                  <div className="space-y-2">
                    {recentReceipts.map((receipt) => (
                      <div key={receipt.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{receipt.transactionNumber}</div>
                          <div className="text-sm text-neutral-500">
                            {receipt.partyId === 1 ? "GlobalTech Solutions" :
                             receipt.partyId === 3 ? "Sundar Innovations" :
                             receipt.partyId === 5 ? "Patel Enterprises" : "Customer"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium text-green-600">
                            {formatCurrency(Number(receipt.amount))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="/finance/receivables/receipts">
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Receipts
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    No recent receipts found
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {isPaymentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-2 animate-pulse">
                        <div className="h-5 bg-neutral-100 rounded w-3/4 mb-1"></div>
                        <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentPayments && recentPayments.length > 0 ? (
                  <div className="space-y-2">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <div className="font-medium">{payment.transactionNumber}</div>
                          <div className="text-sm text-neutral-500">
                            {payment.partyId === 1 ? "GlobalTech Solutions" :
                             payment.partyId === 3 ? "Sundar Innovations" :
                             payment.partyId === 5 ? "Patel Enterprises" : "Vendor"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium text-red-600">
                            {formatCurrency(Number(payment.amount))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link href="/finance/payables/payments">
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Payments
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-neutral-500">
                    No recent payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tally Sync Status</CardTitle>
              <CardDescription>Last sync: {isSyncLoading ? 'Loading...' : syncData?.syncedAt ? new Date(syncData.syncedAt).toLocaleString() : 'Never'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Payment Transactions</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {isSyncLoading ? '...' : 'Synced'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Receipt Transactions</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {isSyncLoading ? '...' : 'Synced'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Open Payments</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {isSyncLoading ? '...' : '2 Pending'}
                  </span>
                </div>
                <div className="pt-4">
                  <Button className="w-full" variant="outline">Sync Now</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receivables Management</CardTitle>
              <CardDescription>Manage your customer receivables and collect payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/finance/receivables/customers">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Wise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">View receivables grouped by customer with aging analysis</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/finance/receivables/invoices">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Invoice Wise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">View all unpaid invoices with due dates and follow-up tools</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/finance/receivables/receipts">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Receipt Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">Record and manage receipt entries and allocations</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              
              <div className="flex justify-center mt-4">
                <Link href="/finance/receivables/aging-analysis">
                  <Button variant="outline">View Aging Analysis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payables Management</CardTitle>
              <CardDescription>Manage your vendor payables and make payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/finance/payables/vendors">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Vendor Wise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">View payables grouped by vendor with aging analysis</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/finance/payables/bills">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Bill Wise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">View all unpaid bills with due dates and payment options</p>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/finance/payables/payments">
                  <Card className="h-full hover:bg-neutral-50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-600">Record and manage payment entries and allocations</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
              
              <div className="flex justify-center mt-4">
                <Link href="/finance/payables/aging-analysis">
                  <Button variant="outline">View Aging Analysis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Receipts Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-4">Set up payment gateway integration for online customer payments</p>
                    <Button variant="outline">Configure Payment Gateway</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-4">Set up payment methods for paying vendors</p>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border rounded">
                        <span>RTGS/NEFT</span>
                        <span className="text-green-600 text-sm">Configured</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>UPI</span>
                        <span className="text-green-600 text-sm">Configured</span>
                      </div>
                      <div className="flex justify-between p-2 border rounded">
                        <span>BNPL</span>
                        <span className="text-yellow-600 text-sm">Partial</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bnpl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BNPL Management</CardTitle>
              <CardDescription>Manage Buy Now Pay Later and Invoice Discounting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase on BNPL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-4">Buy from vendors using BNPL options</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">Available Credit</div>
                          <div className="text-xl font-bold mt-1">{formatCurrency(500000)}</div>
                        </div>
                        <Link href="/finance/bnpl/purchase">
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Invoice Discounting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600 mb-4">Discount your sales invoices for faster payment</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <div className="font-medium">Eligible Invoices</div>
                          <div className="text-xl font-bold mt-1">{formatCurrency(750000)}</div>
                        </div>
                        <Link href="/finance/invoice-discounting">
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;