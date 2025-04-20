import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  FileText, 
  ArrowLeftIcon, 
  EyeIcon, 
  Truck, 
  PlusCircle, 
  MinusCircle, 
  Download, 
  Printer, 
  Send,
  ShoppingBag
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Item, Party, Transaction, TransactionItem } from '@shared/schema';

// Status badge component
export const StatusBadge = ({ status, dueDate, balanceDue }: { 
  status: string, 
  dueDate?: string | Date | null,
  balanceDue?: string | null 
}) => {
  // Override status for display purposes
  let displayStatus = status;
  
  if (balanceDue && Number(balanceDue) === 0) {
    displayStatus = 'paid';
  } else if (balanceDue && Number(balanceDue) > 0 && dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    if (today > due) {
      displayStatus = 'overdue';
    }
  }
  
  const color = getStatusColor(displayStatus);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>
      {getStatusLabel(displayStatus)}
    </span>
  );
};

interface TransactionDetailViewProps {
  transaction: Transaction;
  parties?: Party[];
  onClose: () => void;
  transactionTitle?: string;
  partyType?: 'vendor' | 'customer';
}

const TransactionDetailView = ({ 
  transaction, 
  parties, 
  onClose,
  transactionTitle = 'Transaction',
  partyType = 'vendor'
}: TransactionDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("details");

  // Fetch transaction items
  const { data: transactionItems, isLoading: itemsLoading } = useQuery<TransactionItem[]>({
    queryKey: ['/api/transactions', transaction.id, 'items'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transaction.id}/items`);
      if (!res.ok) {
        throw new Error('Failed to fetch transaction items');
      }
      return res.json();
    }
  });

  // Fetch items for item details
  const { data: itemsData } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  // Get party name and details
  const party = parties?.find(p => p.id === transaction.partyId);
  const partyName = party?.name || 'Unknown';
  
  // Calculate total tax amount
  const totalTaxAmount = transactionItems?.reduce((sum, item) => 
    sum + Number(item.taxAmount || 0), 0) || 0;
  
  // Calculate GST breakup (assuming Indian GST system)
  const calculateGstBreakup = () => {
    if (!transactionItems) return null;
    
    // Assuming tax rate is GST percentage
    const gstRates = [...new Set(transactionItems.map(item => Number(item.taxRate || 0)))];
    
    return gstRates.map(rate => {
      const itemsWithRate = transactionItems.filter(item => Number(item.taxRate || 0) === rate);
      const taxableAmount = itemsWithRate.reduce((sum, item) => 
        sum + (Number(item.amount) || 0), 0);
      const taxAmount = itemsWithRate.reduce((sum, item) => 
        sum + (Number(item.taxAmount) || 0), 0);
      
      // For IGST or CGST+SGST split
      const isIGST = party?.state !== 'Same State as User'; // Simplified logic
      
      return {
        rate,
        taxableAmount,
        igst: isIGST ? taxAmount : 0,
        cgst: !isIGST ? taxAmount / 2 : 0,
        sgst: !isIGST ? taxAmount / 2 : 0,
        total: taxAmount
      };
    });
  };
  
  const gstBreakup = calculateGstBreakup();
  
  // Determine status flow based on transaction type
  const getStatusFlow = () => {
    if (['purchase_bill', 'sales_invoice'].includes(transaction.transactionType)) {
      return ['draft', 'pending', 'approved', 'completed', 'paid'];
    } else if (['purchase_order', 'sales_order'].includes(transaction.transactionType)) {
      return ['draft', 'sent', 'accepted', 'processing', 'completed'];
    } else if (['purchase_quotation', 'quotation'].includes(transaction.transactionType)) {
      return ['draft', 'sent', 'responded', 'accepted', 'rejected'];
    } else {
      return ['draft', 'pending', 'approved', 'completed'];
    }
  };
  
  const statusFlow = getStatusFlow();
  
  // Get item details by ID
  const getItemDetails = (itemId?: number) => {
    if (!itemId || !itemsData) return null;
    return itemsData.find(item => item.id === itemId);
  };
  
  return (
    <Card className="md:w-2/3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{transactionTitle} Details</CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print {transactionTitle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email {transactionTitle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <CardDescription>
          {transactionTitle} #{transaction.transactionNumber}
          <span className="ml-2">
            <StatusBadge 
              status={transaction.status} 
              dueDate={transaction.dueDate} 
              balanceDue={transaction.balanceDue} 
            />
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items & GST</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          {/* DETAILS TAB */}
          <TabsContent value="details">
            {/* Timeline status flow */}
            <div className="mb-6 border rounded-md p-4 bg-neutral-50">
              <h3 className="text-sm font-medium mb-3">Transaction Status Flow</h3>
              <div className="relative flex justify-between items-center">
                {/* Status timeline */}
                <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-neutral-200"></div>
                
                {/* Status points */}
                {statusFlow.map((status, index) => {
                  const isActive = transaction.status === status || 
                    (status === 'paid' && Number(transaction.balanceDue || 0) === 0);
                  
                  // Calculate if this is a past status
                  const statusIndex = statusFlow.indexOf(transaction.status);
                  const isPast = index < statusIndex;
                  
                  return (
                    <div key={status} className={`relative z-10 flex flex-col items-center`}>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                          ${isActive ? 'bg-primary text-white' : isPast ? 'bg-primary/20' : 'bg-neutral-200'}`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium capitalize">
                        {status === 'paid' ? 'Paid' : getStatusLabel(status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Transaction details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">{transactionTitle} Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">{transactionTitle} Number:</span>
                    <span className="font-medium">{transaction.transactionNumber}</span>
                  </div>
                  
                  {/* Vendor or customer bill number if available */}
                  {transaction.vendorBillNumber && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Vendor Bill No:</span>
                      <span className="font-medium">{transaction.vendorBillNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Date:</span>
                    <span>{formatDate(transaction.transactionDate)}</span>
                  </div>
                  
                  {transaction.dueDate && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Due Date:</span>
                      <span>{formatDate(transaction.dueDate)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Status:</span>
                    <StatusBadge 
                      status={transaction.status} 
                      dueDate={transaction.dueDate} 
                      balanceDue={transaction.balanceDue} 
                    />
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Reference:</span>
                    <span>{transaction.reference || 'N/A'}</span>
                  </div>
                  
                  {transaction.expectedDeliveryDate && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Expected Delivery:</span>
                      <span>{formatDate(transaction.expectedDeliveryDate)}</span>
                    </div>
                  )}
                  
                  {transaction.linkedTransactionId && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Linked Transaction:</span>
                      <span className="font-medium text-primary">#{transaction.linkedTransactionId}</span>
                    </div>
                  )}
                  
                  {transaction.inventoryStatus && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Inventory Status:</span>
                      <span>{transaction.inventoryStatus}</span>
                    </div>
                  )}
                </div>
                
                {/* Terms and conditions */}
                {transaction.termsAndConditions && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Terms & Conditions</h3>
                    <div className="bg-neutral-50 p-3 rounded-md border text-sm">
                      {transaction.termsAndConditions}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {partyType === 'vendor' ? 'Vendor' : 'Customer'} & Payment Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">{partyType === 'vendor' ? 'Vendor' : 'Customer'}:</span>
                    <span className="font-medium">{partyName}</span>
                  </div>
                  
                  {party?.gstin && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">GSTIN:</span>
                      <span>{party.gstin}</span>
                    </div>
                  )}
                  
                  {party?.address && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Address:</span>
                      <span className="text-right">{party.address}, {party.city || ''} {party.pincode || ''}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Total Amount:</span>
                    <span className="font-medium">{formatCurrency(Number(transaction.amount))}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Tax Amount:</span>
                    <span className="font-medium">{formatCurrency(totalTaxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Balance Due:</span>
                    <span className={`font-medium ${Number(transaction.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(transaction.balanceDue || 0) > 0 
                        ? formatCurrency(Number(transaction.balanceDue)) 
                        : 'Paid'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Payment Mode:</span>
                    <span>{transaction.paymentMode || 'Not specified'}</span>
                  </div>
                  
                  {transaction.paymentTerms && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Payment Terms:</span>
                      <span>{transaction.paymentTerms}</span>
                    </div>
                  )}
                  
                  {transaction.creditTerms && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Credit Terms:</span>
                      <span>{transaction.creditTerms}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">BNPL:</span>
                    <span>{transaction.isBnpl ? 'Yes' : 'No'}</span>
                  </div>
                  
                  {transaction.bankAccount && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Bank Account:</span>
                      <span>{transaction.bankAccount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <div className="bg-neutral-50 p-3 rounded-md border min-h-[60px]">
                {transaction.notes || 'No notes added.'}
              </div>
            </div>
          </TabsContent>
          
          {/* ITEMS & GST TAB */}
          <TabsContent value="items">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Item Details</h3>
              
              {itemsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(3).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : transactionItems && transactionItems.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>HSN</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Tax %</TableHead>
                        <TableHead className="text-right">Tax Amt</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionItems.map((item, index) => {
                        const itemDetails = getItemDetails(item.itemId);
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{itemDetails?.name || item.description || 'Unknown Item'}</div>
                                {item.description && itemDetails?.name && (
                                  <div className="text-xs text-neutral-500">{item.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{itemDetails?.hsnCode || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity} {itemDetails?.unit || ''}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.rate))}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                            <TableCell className="text-right">{item.taxRate || 0}%</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.taxAmount || 0))}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(Number(item.totalAmount))}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-neutral-50">
                  <ShoppingBag className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500">No items found for this transaction.</p>
                </div>
              )}
              
              {/* GST Summary */}
              {gstBreakup && gstBreakup.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-medium">GST Summary</h3>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tax Rate</TableHead>
                          <TableHead className="text-right">Taxable Amount</TableHead>
                          <TableHead className="text-right">CGST</TableHead>
                          <TableHead className="text-right">SGST</TableHead>
                          <TableHead className="text-right">IGST</TableHead>
                          <TableHead className="text-right">Total Tax</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gstBreakup.map((tax, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{tax.rate}%</TableCell>
                            <TableCell className="text-right">{formatCurrency(tax.taxableAmount)}</TableCell>
                            <TableCell className="text-right">
                              {tax.cgst > 0 ? `${formatCurrency(tax.cgst)} (${tax.rate/2}%)` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {tax.sgst > 0 ? `${formatCurrency(tax.sgst)} (${tax.rate/2}%)` : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {tax.igst > 0 ? `${formatCurrency(tax.igst)} (${tax.rate}%)` : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(tax.total)}</TableCell>
                          </TableRow>
                        ))}
                        
                        {/* Totals row */}
                        <TableRow className="bg-neutral-50">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(gstBreakup.reduce((sum, tax) => sum + tax.taxableAmount, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(gstBreakup.reduce((sum, tax) => sum + tax.cgst, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(gstBreakup.reduce((sum, tax) => sum + tax.sgst, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(gstBreakup.reduce((sum, tax) => sum + tax.igst, 0))}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(gstBreakup.reduce((sum, tax) => sum + tax.total, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {/* TDS section if applicable (for purchase bills) */}
              {transaction.tdsCategory && (
                <div className="mt-6 border p-4 rounded-md bg-neutral-50">
                  <h3 className="text-sm font-medium mb-2">TDS Details</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500 block">TDS Category:</span>
                      <span className="font-medium">{transaction.tdsCategory}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">TDS Percentage:</span>
                      <span className="font-medium">{transaction.tdsPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">TDS Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(Number(transaction.amount) * (Number(transaction.tdsPercentage || 0) / 100))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* TRANSPORT TAB */}
          <TabsContent value="transport">
            <div className="border rounded-md p-4">
              <div className="flex items-center mb-4">
                <Truck className="h-5 w-5 text-neutral-400 mr-2" />
                <h3 className="text-sm font-medium">Transport and Delivery Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Delivery Status:</span>
                    <span>{transaction.inventoryStatus || 'Not specified'}</span>
                  </div>
                  
                  {transaction.expectedDeliveryDate && (
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-neutral-500">Expected Delivery:</span>
                      <span>{formatDate(transaction.expectedDeliveryDate)}</span>
                    </div>
                  )}
                  
                  {/* These fields would need to be added to your schema */}
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Shipping Method:</span>
                    <span>Standard Delivery</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">Tracking Number:</span>
                    <span>Not available</span>
                  </div>
                  
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-neutral-500">E-Way Bill:</span>
                    <span>Not generated</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <h4 className="font-medium text-neutral-500">Shipping Address</h4>
                  
                  {party?.address ? (
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">{partyName}</p>
                      <p>{party.address}</p>
                      {party.city && party.state && (
                        <p>{party.city}, {party.state} {party.pincode || ''}</p>
                      )}
                      {party.phone && <p>Phone: {party.phone}</p>}
                    </div>
                  ) : (
                    <div className="text-neutral-500 italic">
                      No shipping address available
                    </div>
                  )}
                  
                  <div className="flex mt-4">
                    <Button variant="outline" size="sm" className="w-full mt-2" disabled>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Transport Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* HISTORY TAB */}
          <TabsContent value="history">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-4">Transaction History</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Transaction created</p>
                    <p className="text-xs text-neutral-500">{formatDate(transaction.createdAt || new Date())}</p>
                  </div>
                </div>
                
                {/* Sample history entries - would be populated from backend in a real implementation */}
                <div className="flex items-start">
                  <div className="bg-neutral-100 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                    <Send className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status changed to {getStatusLabel(transaction.status)}</p>
                    <p className="text-xs text-neutral-500">{formatDate(transaction.createdAt || new Date())}</p>
                  </div>
                </div>
                
                {transaction.isSync && (
                  <div className="flex items-start">
                    <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                      <ArrowLeftIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Synced with Tally</p>
                      <p className="text-xs text-neutral-500">{formatDate(transaction.createdAt || new Date())}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline">Edit {transactionTitle}</Button>
          {['sales_invoice', 'purchase_bill'].includes(transaction.transactionType) && 
           Number(transaction.balanceDue || 0) > 0 && (
            <Button>
              {transaction.transactionType === 'sales_invoice' ? 'Record Receipt' : 'Record Payment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionDetailView;