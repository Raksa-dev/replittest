import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Party } from '@shared/schema';
import { ArrowUpDown, MailIcon, RefreshCw } from 'lucide-react';

interface VendorWithBalances extends Party {
  totalPayable: number;
  lastPaymentDate: string | null;
  oldestDueDate: string | null;
}

const VendorPayables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('totalPayable');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Fetch vendors with outstanding payables
  const { data: vendors, isLoading } = useQuery<VendorWithBalances[]>({
    queryKey: ['/api/finance/payables/vendors'],
  });
  
  // Sort and filter vendors
  const filteredVendors = vendors
    ? vendors
        .filter(vendor => 
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'totalPayable':
              comparison = a.totalPayable - b.totalPayable;
              break;
            case 'lastPaymentDate':
              comparison = a.lastPaymentDate && b.lastPaymentDate 
                ? new Date(a.lastPaymentDate).getTime() - new Date(b.lastPaymentDate).getTime()
                : 0;
              break;
            case 'oldestDueDate':
              comparison = a.oldestDueDate && b.oldestDueDate 
                ? new Date(a.oldestDueDate).getTime() - new Date(b.oldestDueDate).getTime()
                : 0;
              break;
            default:
              comparison = 0;
          }
          
          return sortOrder === 'asc' ? comparison : -comparison;
        })
    : [];
  
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };
  
  const SortableHeader = ({ column, label }: { column: string, label: string }) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={() => handleSort(column)}
    >
      {label}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === column ? 'opacity-100' : 'opacity-40'}`} />
    </div>
  );
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Vendor Payables</h1>
          <p className="text-sm text-neutral-500">Manage payables by vendor</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Search vendors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[300px]"
          />
          <Link href="/finance/payables/aging-analysis">
            <Button variant="outline">Aging Analysis</Button>
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor Payables</CardTitle>
          <CardDescription>
            View payables by vendor as of {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-neutral-100 rounded-md"></div>
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
              ))}
            </div>
          ) : filteredVendors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><SortableHeader column="name" label="Company Name" /></TableHead>
                    <TableHead className="text-right"><SortableHeader column="totalPayable" label="Total Payable" /></TableHead>
                    <TableHead><SortableHeader column="lastPaymentDate" label="Last Payment Date" /></TableHead>
                    <TableHead><SortableHeader column="oldestDueDate" label="Oldest Due" /></TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-neutral-50">
                      <TableCell>
                        <Link href={`/finance/payables/vendors/${vendor.id}`}>
                          <span className="font-medium cursor-pointer hover:text-blue-600">
                            {vendor.name}
                          </span>
                        </Link>
                        <div className="text-xs text-neutral-500">{vendor.gstin}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(vendor.totalPayable)}
                      </TableCell>
                      <TableCell>
                        {vendor.lastPaymentDate 
                          ? formatDate(vendor.lastPaymentDate)
                          : <span className="text-neutral-400">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        {vendor.oldestDueDate 
                          ? formatDate(vendor.oldestDueDate)
                          : <span className="text-neutral-400">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MailIcon className="h-4 w-4 mr-1" />
                            Follow Up
                          </Button>
                          <Link href={`/finance/payables/payments/new?vendorId=${vendor.id}`}>
                            <Button size="sm">
                              Make Payment
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <RefreshCw className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No payables found</h3>
              <p className="text-neutral-500 mb-4">
                {searchTerm
                  ? `No vendors matching "${searchTerm}" found`
                  : 'There are no payables to display'}
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayables;