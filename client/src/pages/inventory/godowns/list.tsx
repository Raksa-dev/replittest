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

interface Godown {
  id: number;
  name: string;
  parentName?: string | null;
  address?: string | null;
  userId: number;
}

const GodownsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch godowns
  const { data: godowns, isLoading } = useQuery<Godown[]>({
    queryKey: ['/api/inventory/godowns'],
  });

  // Filter and sort godowns
  const filteredGodowns = godowns
    ? godowns
        .filter(godown =>
          godown.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (godown.parentName && godown.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (godown.address && godown.address.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <CardTitle>Godowns</CardTitle>
            <CardDescription>
              Manage your inventory locations and warehouses
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search godowns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/inventory/godowns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Godown
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
        ) : filteredGodowns.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="name" label="Godown Name" /></TableHead>
                  <TableHead><SortableHeader column="parentName" label="Parent Godown" /></TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGodowns.map((godown) => (
                  <TableRow key={godown.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{godown.name}</TableCell>
                    <TableCell>{godown.parentName || '-'}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {godown.address || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/godowns/${godown.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/inventory/godowns/${godown.id}/edit`}>
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
            <h3 className="text-lg font-medium mb-2">No godowns found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? `No godowns matching "${searchTerm}" found`
                : 'There are no godowns added yet'}
            </p>
            <Link href="/inventory/godowns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Godown
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GodownsList;