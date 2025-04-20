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
  ShoppingBag,
  ChevronRight
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

export const StatusBadge = ({ status, dueDate, balanceDue }: { 
  status: string, 
  dueDate?: string | Date | null,
  balanceDue?: string | null 
}) => {
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

  const { data: transactionItems, isLoading: itemsLoading } = useQuery<TransactionItem[]>({
    queryKey: ['/api/transactions', transaction.id, 'items'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transaction.id}/items`);
      if (!res.ok) throw new Error('Failed to fetch transaction items');
      return res.json();
    }
  });

  const { data: itemsData } = useQuery<Item[]>({
    queryKey: ['/api/items'],
  });

  const party = parties?.find(p => p.id === transaction.partyId);
  const partyName = party?.name || 'Unknown';

  const totalTaxAmount = transactionItems?.reduce((sum, item) => 
    sum + Number(item.taxAmount || 0), 0) || 0;

  const calculateGstBreakup = () => {
    if (!transactionItems) return null;

    const gstRates = [...new Set(transactionItems.map(item => Number(item.taxRate || 0)))];

    return gstRates.map(rate => {
      const itemsWithRate = transactionItems.filter(item => Number(item.taxRate || 0) === rate);
      const taxableAmount = itemsWithRate.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const taxAmount = itemsWithRate.reduce((sum, item) => sum + (Number(item.taxAmount) || 0), 0);
      const isIGST = party?.state !== 'Same State as User';

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

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{transactionTitle} #{transaction.transactionNumber}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Link href={`/${partyType}s/${transaction.partyId}`}>
                  {partyName}
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <StatusBadge 
                  status={transaction.status} 
                  dueDate={transaction.dueDate} 
                  balanceDue={transaction.balanceDue} 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {transaction.status !== 'paid' && transaction.status !== 'cancelled' && (
              <Button size="sm">Record Payment</Button>
            )}
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="details">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {itemsLoading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-8 bg-gray-200 rounded" />
                          <div className="h-20 bg-gray-100 rounded" />
                          <div className="h-20 bg-gray-100 rounded" />
                        </div>
                      ) : transactionItems && transactionItems.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Item & Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionItems.map((item, index) => {
                              const itemDetails = itemsData?.find(i => i.id === item.itemId);
                              return (
                                <TableRow key={item.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div className="font-medium">{itemDetails?.name || 'Unknown Item'}</div>
                                    {item.description && (
                                      <div className="text-sm text-gray-500">{item.description}</div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(Number(item.rate))}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(Number(item.amount))}</TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow>
                              <TableCell colSpan={4} className="text-right font-medium">
                                Subtotal
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(Number(transaction.amount) - totalTaxAmount)}
                              </TableCell>
                            </TableRow>
                            {gstBreakup?.map((tax, index) => (
                              <TableRow key={index}>
                                <TableCell colSpan={4} className="text-right text-gray-500">
                                  GST @ {tax.rate}%
                                </TableCell>
                                <TableCell className="text-right text-gray-500">
                                  {formatCurrency(tax.total)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={4} className="text-right font-bold">
                                Total
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatCurrency(Number(transaction.amount))}
                              </TableCell>
                            </TableRow>
                            {Number(transaction.balanceDue || 0) > 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-right font-bold text-red-600">
                                  Balance Due
                                </TableCell>
                                <TableCell className="text-right font-bold text-red-600">
                                  {formatCurrency(Number(transaction.balanceDue))}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No items found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="col-span-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <StatusBadge 
                            status={transaction.status} 
                            dueDate={transaction.dueDate} 
                            balanceDue={transaction.balanceDue}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date</span>
                          <span>{formatDate(transaction.transactionDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due Date</span>
                          <span>{transaction.dueDate ? formatDate(transaction.dueDate) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reference</span>
                          <span>{transaction.reference || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Terms</span>
                          <span>{transaction.paymentTerms || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Mode</span>
                          <span>{transaction.paymentMode || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Balance Due</span>
                          <span className={Number(transaction.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                            {Number(transaction.balanceDue || 0) > 0 
                              ? formatCurrency(Number(transaction.balanceDue)) 
                              : 'Paid'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No payments recorded
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No comments yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Transaction created</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.createdAt || new Date())}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailView;