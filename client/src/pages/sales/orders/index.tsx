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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transaction } from '@shared/schema';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getStatusLabel
} from '@/lib/utils';
import { ChevronDownIcon, FilterIcon } from 'lucide-react';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch sales orders
  const { data: orders, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { type: 'sales_order' }],
  });
  
  // Filter by search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = activeTab === 'all' || 
      (activeTab === 'open' && (order.status === 'open' || order.status === 'pending' || order.status === 'approved')) ||
      (activeTab === 'processing' && (order.status === 'processing' || order.status === 'packing' || order.status === 'shipped')) ||
      (activeTab === 'completed' && (order.status === 'delivered' || order.status === 'completed')) ||
      (activeTab === 'cancelled' && order.status === 'cancelled');
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const color = getStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Sales Orders</h1>
          <p className="text-sm text-neutral-500">Manage your sales orders from customers</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <Input 
            className="max-w-[300px]" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/sales/orders/new">
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Order
            </Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>All Sales Orders</CardTitle>
            <CardDescription>View and manage your sales orders</CardDescription>
          </div>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
                <DropdownMenuItem>Last Month</DropdownMenuItem>
                <DropdownMenuItem>This Year</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All Orders</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <span>Export</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem>Print Order List</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-neutral-100 rounded-md"></div>
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.transactionNumber}</TableCell>
                        <TableCell>{formatDate(order.transactionDate)}</TableCell>
                        <TableCell>
                          {order.partyId === 1 ? "GlobalTech Solutions" :
                           order.partyId === 3 ? "Sundar Innovations" :
                           order.partyId === 5 ? "Patel Enterprises" : "Customer"}
                        </TableCell>
                        <TableCell>{formatCurrency(Number(order.amount))}</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/sales/orders/${order.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            
                            {order.status !== 'cancelled' && order.status !== 'completed' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm">Actions</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <Link href={`/sales/orders/${order.id}/edit`}>
                                    <DropdownMenuItem>Edit Order</DropdownMenuItem>
                                  </Link>
                                  <Link href={`/sales/delivery-notes/new?orderId=${order.id}`}>
                                    <DropdownMenuItem>Create Delivery Note</DropdownMenuItem>
                                  </Link>
                                  <Link href={`/sales/invoices/new?orderId=${order.id}`}>
                                    <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <Link href={`/sales/orders/${order.id}/print`}>
                                    <DropdownMenuItem>Print Order</DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem>Email to Customer</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-neutral-500">
                  No sales orders found matching your search criteria.
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;