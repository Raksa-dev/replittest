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
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, ArrowUpDown, Eye, Edit } from 'lucide-react';

interface StockCategory {
  id: number;
  name: string;
  quantitySold?: number;
  quantityInStock?: number;
  salesValue?: number;
  inventoryValue?: number;
  avgSalesPrice?: number;
  avgCostPrice?: number;
  userId: number;
}

const StockCategoriesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch stock categories
  const { data: stockCategories, isLoading } = useQuery<StockCategory[]>({
    queryKey: ['/api/inventory/stock-categories'],
  });

  // Filter and sort stock categories
  const filteredCategories = stockCategories
    ? stockCategories
        .filter(category =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'quantitySold':
              comparison = (a.quantitySold || 0) - (b.quantitySold || 0);
              break;
            case 'quantityInStock':
              comparison = (a.quantityInStock || 0) - (b.quantityInStock || 0);
              break;
            case 'salesValue':
              comparison = (a.salesValue || 0) - (b.salesValue || 0);
              break;
            case 'inventoryValue':
              comparison = (a.inventoryValue || 0) - (b.inventoryValue || 0);
              break;
            case 'avgSalesPrice':
              comparison = (a.avgSalesPrice || 0) - (b.avgSalesPrice || 0);
              break;
            case 'avgCostPrice':
              comparison = (a.avgCostPrice || 0) - (b.avgCostPrice || 0);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Stock Categories</CardTitle>
            <CardDescription>
              Manage your inventory stock categories
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/inventory/stock-categories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
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
        ) : filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="name" label="Category Name" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="quantitySold" label="QTY Sold" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="quantityInStock" label="QTY in Stock" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="salesValue" label="Sales by Value" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="inventoryValue" label="Inventory Value" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="avgSalesPrice" label="AVG Sales Price" /></TableHead>
                  <TableHead className="text-right"><SortableHeader column="avgCostPrice" label="AVG Cost Price" /></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">{category.quantitySold || 0}</TableCell>
                    <TableCell className="text-right">{category.quantityInStock || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.salesValue || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.inventoryValue || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.avgSalesPrice || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.avgCostPrice || 0)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/stock-categories/${category.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventory/stock-categories/${category.id}/edit`}>
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
            <h3 className="text-lg font-medium mb-2">No stock categories found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? `No categories matching "${searchTerm}" found`
                : 'There are no stock categories added yet'}
            </p>
            <Link href="/inventory/stock-categories/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Category
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCategoriesList;