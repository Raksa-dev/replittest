import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transaction, Party } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

const Receivables = () => {
  const [viewMode, setViewMode] = useState('customer'); // 'customer' or 'invoice'
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  
  // Fetch sales invoices with balance due
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'sales_invoice' }],
  });
  
  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Party[]>({
    queryKey: ['/api/parties', { type: 'customer' }],
  });
  
  // Filter invoices to only show receivables (those with balance due)
  const receivableInvoices = invoices?.filter(invoice => 
    Number(invoice.balanceDue) > 0 && ['pending', 'overdue', 'partially_paid'].includes(invoice.status)
  );
  
  // Get customer-wise totals
  const customerWiseTotals = receivableInvoices?.reduce((acc: Record<number, { total: number, overdue: number, invoiceCount: number }>, invoice) => {
    if (!invoice.partyId) return acc;
    
    if (!acc[invoice.partyId]) {
      acc[invoice.partyId] = { total: 0, overdue: 0, invoiceCount: 0 };
    }
    
    acc[invoice.partyId].total += Number(invoice.balanceDue);
    acc[invoice.partyId].invoiceCount += 1;
    
    // Check if invoice is overdue
    if (invoice.status === 'overdue') {
      acc[invoice.partyId].overdue += Number(invoice.balanceDue);
    }
    
    return acc;
  }, {});
  
  // Filter invoices by selected customer
  const customerInvoices = selectedCustomerId 
    ? receivableInvoices?.filter(invoice => invoice.partyId === selectedCustomerId) 
    : [];
  
  // Get customer name by ID
  const getCustomerName = (partyId?: number) => {
    if (!partyId || !customers) return 'Unknown Customer';
    const customer = customers.find(c => c.id === partyId);
    return customer?.name || 'Unknown Customer';
  };
  
  // Handle customer selection
  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setViewMode('invoice');
  };
  
  // Go back to customer view
  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
    setViewMode('customer');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Receivables</h1>
          <p className="text-sm text-neutral-500">Track and manage your customer receivables</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">Send Reminders</Button>
          <Button>Record Receipt</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {viewMode === 'customer' ? 'Customer Receivables' : `Invoices - ${getCustomerName(selectedCustomerId || undefined)}`}
              </CardTitle>
              <CardDescription>
                {viewMode === 'customer' 
                  ? 'View receivables by customer' 
                  : 'View individual invoices for this customer'}
              </CardDescription>
            </div>
            {viewMode === 'invoice' && (
              <Button variant="ghost" onClick={handleBackToCustomers}>
                ← Back to Customers
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'customer' ? (
            // Customer view
            <div>
              {customersLoading || invoicesLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/3 mb-1"></div>
                      <div className="flex justify-between mt-2">
                        <div className="h-3 bg-neutral-200 rounded w-24"></div>
                        <div className="h-3 bg-neutral-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : customerWiseTotals && Object.keys(customerWiseTotals).length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 text-xs font-medium text-neutral-500 mb-2 px-4">
                    <div className="col-span-2">CUSTOMER</div>
                    <div className="text-right">TOTAL DUE</div>
                    <div className="text-right">OVERDUE</div>
                    <div className="text-right">ACTIONS</div>
                  </div>
                  
                  {customers?.filter(customer => customerWiseTotals[customer.id]?.total > 0).map(customer => (
                    <div 
                      key={customer.id} 
                      className="border rounded-md p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleCustomerSelect(customer.id)}
                    >
                      <div className="grid grid-cols-5 items-center">
                        <div className="col-span-2">
                          <h3 className="font-medium">{customer.name}</h3>
                          <p className="text-xs text-neutral-500">
                            {customerWiseTotals[customer.id]?.invoiceCount} {customerWiseTotals[customer.id]?.invoiceCount === 1 ? 'invoice' : 'invoices'}
                          </p>
                        </div>
                        <div className="text-right font-medium font-mono">
                          {formatCurrency(customerWiseTotals[customer.id]?.total || 0)}
                        </div>
                        <div className="text-right">
                          {customerWiseTotals[customer.id]?.overdue > 0 && (
                            <span className="text-red-600 font-mono">
                              {formatCurrency(customerWiseTotals[customer.id]?.overdue || 0)}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, implement reminder functionality
                          }}>
                            Remind
                          </Button>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, implement receipt recording
                          }}>
                            Record Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No receivables found. All customer invoices are paid.
                </div>
              )}
            </div>
          ) : (
            // Invoice view for selected customer
            <div>
              {invoicesLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array(3).fill(null).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/3 mb-1"></div>
                      <div className="flex justify-between mt-2">
                        <div className="h-3 bg-neutral-200 rounded w-24"></div>
                        <div className="h-3 bg-neutral-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : customerInvoices && customerInvoices.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 text-xs font-medium text-neutral-500 mb-2 px-4">
                    <div>INVOICE #</div>
                    <div>DATE</div>
                    <div>DUE DATE</div>
                    <div className="text-right">AMOUNT</div>
                    <div className="text-right">BALANCE DUE</div>
                    <div className="text-right">ACTIONS</div>
                  </div>
                  
                  {customerInvoices.map(invoice => (
                    <div key={invoice.id} className="border rounded-md p-4 hover:bg-neutral-50">
                      <div className="grid grid-cols-6 items-center">
                        <div>
                          <span className="font-medium">{invoice.transactionNumber}</span>
                        </div>
                        <div>
                          <span className="text-sm">{formatDate(invoice.transactionDate)}</span>
                        </div>
                        <div>
                          <span className="text-sm">{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</span>
                        </div>
                        <div className="text-right font-mono">
                          {formatCurrency(Number(invoice.amount))}
                        </div>
                        <div className="text-right font-mono">
                          <span className={Number(invoice.balanceDue) > 0 ? 'text-red-600' : ''}>
                            {formatCurrency(Number(invoice.balanceDue))}
                          </span>
                        </div>
                        <div className="text-right flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="outline" size="sm">Remind</Button>
                          <Button size="sm">Record Receipt</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No open invoices found for this customer.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Receivables;
