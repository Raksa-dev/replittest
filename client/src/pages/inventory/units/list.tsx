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
import { Plus, Search, ArrowUpDown, Edit } from 'lucide-react';

interface Unit {
  id: number;
  symbol: string;
  formalName: string;
  uqcFrom?: string | null;
  uqc?: string | null;
  userId: number;
}

const UnitsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch units
  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ['/api/inventory/units'],
  });

  // Filter and sort units
  const filteredUnits = units
    ? units
        .filter(unit =>
          unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.formalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (unit.uqc && unit.uqc.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'symbol':
              comparison = a.symbol.localeCompare(b.symbol);
              break;
            case 'formalName':
              comparison = a.formalName.localeCompare(b.formalName);
              break;
            case 'uqc':
              if (!a.uqc && !b.uqc) return 0;
              if (!a.uqc) return 1;
              if (!b.uqc) return -1;
              comparison = a.uqc.localeCompare(b.uqc);
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
            <CardTitle>Units of Measurement</CardTitle>
            <CardDescription>
              Manage your inventory units of measurement
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Link href="/inventory/units/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
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
        ) : filteredUnits.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader column="symbol" label="Symbol" /></TableHead>
                  <TableHead><SortableHeader column="formalName" label="Formal Name" /></TableHead>
                  <TableHead>UQC From</TableHead>
                  <TableHead><SortableHeader column="uqc" label="UQC" /></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id} className="hover:bg-neutral-50">
                    <TableCell className="font-medium">{unit.symbol}</TableCell>
                    <TableCell>{unit.formalName}</TableCell>
                    <TableCell>{unit.uqcFrom || '-'}</TableCell>
                    <TableCell>{unit.uqc || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/units/${unit.id}/edit`}>
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
            <h3 className="text-lg font-medium mb-2">No units found</h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm
                ? `No units matching "${searchTerm}" found`
                : 'There are no units added yet'}
            </p>
            <Link href="/inventory/units/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitsList;