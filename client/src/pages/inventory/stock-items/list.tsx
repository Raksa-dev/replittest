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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ArrowUpDown, Eye, Edit } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StockItem {
  id: number;
  name: string;
  userId: number;
  hsnCode?: string | null;
  unit?: string | null;
  category?: string | null;
  description?: string | null;
  sellingPrice?: string | null;
  purchasePrice?: string | null;
  openingStock?: string | null;
  minStockLevel?: string | null;
  createdAt: Date | null;
  // Additional fields for the UI
  quantitySold?: number;
  quantityInStock?: number;
  salesValue?: number;
  price?: number;
  costPrice?: number;
  gstRate?: number;
}

const StockItemsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch stock items
  const { data: stockItems, isLoading } = useQuery<StockItem[]>({
    queryKey: ['/api/inventory/items'],
  });

  // Filter and sort stock items
  const filteredItems = stockItems
    ? stockItems
        .filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.hsnCode && item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'category':
              if (!a.category && !b.category) return 0;
              if (!a.category) return 1;
              if (!b.category) return -1;
              comparison = a.category.localeCompare(b.category);
              break;
            case 'unit':
              if (!a.unit && !b.unit) return 0;
              if (!a.unit) return 1;
              if (!b.unit) return -1;
              comparison = a.unit.localeCompare(b.unit);
              break;
            case 'sellingPrice':
              const aPrice = a.sellingPrice ? parseFloat(a.sellingPrice) : 0;
              const bPrice = b.sellingPrice ? parseFloat(b.sellingPrice) : 0;
              comparison = aPrice - bPrice;
              break;
            case 'purchasePrice':
              const aCost = a.purchasePrice ? parseFloat(a.purchasePrice) : 0;
              const bCost = b.purchasePrice ? parseFloat(b.purchasePrice) : 0;
              comparison = aCost - bCost;
              break;
            case 'openingStock':
              const aStock = a.openingStock ? parseFloat(a.openingStock) : 0;
              const bStock = b.openingStock ? parseFloat(b.openingStock) : 0;
              comparison = aStock - bStock;
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
      setSortOrder('asc');
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

  const getStockStatus = (item: StockItem) => {
    const stock = item.openingStock ? parseFloat(item.openingStock) : 0;
    const minLevel = item.minStockLevel ? parseFloat(item.minStockLevel) : 0;
    
    if (stock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (minLevel > 0 && stock <= minLevel) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Stock Items</CardTitle>
            <CardDescription>
              Manage your inventory stock items
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search stock items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/inventory/stock-items/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-neutral-100 rounded-md"></div>
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-50 rounded-md"></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="name" label="Item Name" /></TableHead>
                  <TableHead><SortableHeader column="category" label="Category" /></TableHead>
                  <TableHead><SortableHeader column="unit" label="Unit" /></TableHead>
                  <TableHead><SortableHeader column="sellingPrice" label="Selling Price" /></TableHead>
                  <TableHead><SortableHeader column="purchasePrice" label="Purchase Price" /></TableHead>
                  <TableHead><SortableHeader column="openingStock" label="Stock" /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>{item.unit || '-'}</TableCell>
                    <TableCell>
                      {item.sellingPrice ? formatCurrency(parseFloat(item.sellingPrice)) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.purchasePrice ? formatCurrency(parseFloat(item.purchasePrice)) : '-'}
                    </TableCell>
                    <TableCell>{item.openingStock || '0'}</TableCell>
                    <TableCell>{getStockStatus(item)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/stock-items/${item.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventory/stock-items/${item.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
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
            <h3 className="text-lg font-medium mb-2">No stock items found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? `No stock items matching "${searchTerm}" found`
                : 'There are no stock items added yet'}
            </p>
            <Link href="/inventory/stock-items/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Item
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockItemsList;