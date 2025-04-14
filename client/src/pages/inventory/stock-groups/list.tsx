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
import { Plus, Search, ArrowUpDown, Eye, Edit } from 'lucide-react';

interface StockGroup {
  id: number;
  name: string;
  parentName?: string | null;
  hsnCode?: string | null;
  gstRate?: number | null;
  userId: number;
}

const StockGroupsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch stock groups
  const { data: stockGroups, isLoading } = useQuery<StockGroup[]>({
    queryKey: ['/api/inventory/stock-groups'],
  });

  // Filter and sort stock groups
  const filteredStockGroups = stockGroups
    ? stockGroups
        .filter(group =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (group.parentName && group.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (group.hsnCode && group.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'parentName':
              if (!a.parentName && !b.parentName) return 0;
              if (!a.parentName) return 1;
              if (!b.parentName) return -1;
              comparison = a.parentName.localeCompare(b.parentName);
              break;
            case 'hsnCode':
              if (!a.hsnCode && !b.hsnCode) return 0;
              if (!a.hsnCode) return 1;
              if (!b.hsnCode) return -1;
              comparison = a.hsnCode.localeCompare(b.hsnCode);
              break;
            case 'gstRate':
              if (a.gstRate === null && b.gstRate === null) return 0;
              if (a.gstRate === null) return 1;
              if (b.gstRate === null) return -1;
              comparison = a.gstRate - b.gstRate;
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
            <CardTitle>Stock Groups</CardTitle>
            <CardDescription>
              Manage your inventory stock groups and categories
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search stock groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/inventory/stock-groups/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Group
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
        ) : filteredStockGroups.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="name" label="Group Name" /></TableHead>
                  <TableHead><SortableHeader column="parentName" label="Parent Group" /></TableHead>
                  <TableHead><SortableHeader column="hsnCode" label="HSN Code" /></TableHead>
                  <TableHead><SortableHeader column="gstRate" label="GST Rate" /></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockGroups.map((group) => (
                  <TableRow key={group.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.parentName || '-'}</TableCell>
                    <TableCell>{group.hsnCode || '-'}</TableCell>
                    <TableCell>{group.gstRate !== null ? `${group.gstRate}%` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/stock-groups/${group.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventory/stock-groups/${group.id}/edit`}>
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
            <h3 className="text-lg font-medium mb-2">No stock groups found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? `No stock groups matching "${searchTerm}" found`
                : 'There are no stock groups added yet'}
            </p>
            <Link href="/inventory/stock-groups/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Group
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockGroupsList;