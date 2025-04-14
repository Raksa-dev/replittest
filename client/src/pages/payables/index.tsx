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
import { Transaction, Party } from '@shared/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

const Payables = () => {
  const [viewMode, setViewMode] = useState('vendor'); // 'vendor' or 'bill'
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  
  // Fetch purchase bills with balance due
  const { data: bills, isLoading: billsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'purchase_bill' }],
  });
  
  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery<Party[]>({
    queryKey: ['/api/parties', { type: 'vendor' }],
  });
  
  // Filter bills to only show payables (those with balance due)
  const payableBills = bills?.filter(bill => 
    Number(bill.balanceDue) > 0 && ['pending', 'overdue', 'partially_paid'].includes(bill.status)
  );
  
  // Get vendor-wise totals
  const vendorWiseTotals = payableBills?.reduce((acc: Record<number, { total: number, overdue: number, billCount: number }>, bill) => {
    if (!bill.partyId) return acc;
    
    if (!acc[bill.partyId]) {
      acc[bill.partyId] = { total: 0, overdue: 0, billCount: 0 };
    }
    
    acc[bill.partyId].total += Number(bill.balanceDue);
    acc[bill.partyId].billCount += 1;
    
    // Check if bill is overdue
    if (bill.status === 'overdue') {
      acc[bill.partyId].overdue += Number(bill.balanceDue);
    }
    
    return acc;
  }, {});
  
  // Filter bills by selected vendor
  const vendorBills = selectedVendorId 
    ? payableBills?.filter(bill => bill.partyId === selectedVendorId) 
    : [];
  
  // Get vendor name by ID
  const getVendorName = (partyId?: number) => {
    if (!partyId || !vendors) return 'Unknown Vendor';
    const vendor = vendors.find(v => v.id === partyId);
    return vendor?.name || 'Unknown Vendor';
  };
  
  // Handle vendor selection
  const handleVendorSelect = (vendorId: number) => {
    setSelectedVendorId(vendorId);
    setViewMode('bill');
  };
  
  // Go back to vendor view
  const handleBackToVendors = () => {
    setSelectedVendorId(null);
    setViewMode('vendor');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Payables</h1>
          <p className="text-sm text-neutral-500">Manage your vendor payments</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">BNPL Options</Button>
          <Button>Make Payment</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {viewMode === 'vendor' ? 'Vendor Payables' : `Bills - ${getVendorName(selectedVendorId || undefined)}`}
              </CardTitle>
              <CardDescription>
                {viewMode === 'vendor' 
                  ? 'View payables by vendor' 
                  : 'View individual bills for this vendor'}
              </CardDescription>
            </div>
            {viewMode === 'bill' && (
              <Button variant="ghost" onClick={handleBackToVendors}>
                ← Back to Vendors
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'vendor' ? (
            // Vendor view
            <div>
              {vendorsLoading || billsLoading ? (
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
              ) : vendorWiseTotals && Object.keys(vendorWiseTotals).length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 text-xs font-medium text-neutral-500 mb-2 px-4">
                    <div className="col-span-2">VENDOR</div>
                    <div className="text-right">TOTAL PAYABLE</div>
                    <div className="text-right">OVERDUE</div>
                    <div className="text-right">ACTIONS</div>
                  </div>
                  
                  {vendors?.filter(vendor => vendorWiseTotals[vendor.id]?.total > 0).map(vendor => (
                    <div 
                      key={vendor.id} 
                      className="border rounded-md p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <div className="grid grid-cols-5 items-center">
                        <div className="col-span-2">
                          <h3 className="font-medium">{vendor.name}</h3>
                          <p className="text-xs text-neutral-500">
                            {vendorWiseTotals[vendor.id]?.billCount} {vendorWiseTotals[vendor.id]?.billCount === 1 ? 'bill' : 'bills'}
                          </p>
                        </div>
                        <div className="text-right font-medium font-mono">
                          {formatCurrency(vendorWiseTotals[vendor.id]?.total || 0)}
                        </div>
                        <div className="text-right">
                          {vendorWiseTotals[vendor.id]?.overdue > 0 && (
                            <span className="text-red-600 font-mono">
                              {formatCurrency(vendorWiseTotals[vendor.id]?.overdue || 0)}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex justify-end space-x-2">
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            // In a real app, implement payment functionality
                          }}>
                            Make Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No payables found. All vendor bills are paid.
                </div>
              )}
            </div>
          ) : (
            // Bill view for selected vendor
            <div>
              {billsLoading ? (
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
              ) : vendorBills && vendorBills.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 text-xs font-medium text-neutral-500 mb-2 px-4">
                    <div>BILL #</div>
                    <div>DATE</div>
                    <div>DUE DATE</div>
                    <div className="text-right">AMOUNT</div>
                    <div className="text-right">BALANCE DUE</div>
                    <div className="text-right">ACTIONS</div>
                  </div>
                  
                  {vendorBills.map(bill => (
                    <div key={bill.id} className="border rounded-md p-4 hover:bg-neutral-50">
                      <div className="grid grid-cols-6 items-center">
                        <div>
                          <span className="font-medium">{bill.transactionNumber}</span>
                        </div>
                        <div>
                          <span className="text-sm">{formatDate(bill.transactionDate)}</span>
                        </div>
                        <div>
                          <span className="text-sm">{bill.dueDate ? formatDate(bill.dueDate) : '-'}</span>
                        </div>
                        <div className="text-right font-mono">
                          {formatCurrency(Number(bill.amount))}
                        </div>
                        <div className="text-right font-mono">
                          <span className={Number(bill.balanceDue) > 0 ? 'text-red-600' : ''}>
                            {formatCurrency(Number(bill.balanceDue))}
                          </span>
                        </div>
                        <div className="text-right flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button size="sm">Make Payment</Button>
                        </div>
                      </div>
                      {bill.isBnpl && (
                        <div className="mt-2 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded inline-block">
                          Using BNPL
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No open bills found for this vendor.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payables;
