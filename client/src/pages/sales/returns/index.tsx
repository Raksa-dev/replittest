
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';

const Returns = () => {
  const { data: returns, isLoading } = useQuery({
    queryKey: ['salesReturns'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?type=sales_return');
      return response.json();
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Sales Returns</h1>
          <p className="text-sm text-neutral-500">Manage your sales returns</p>
        </div>
        <Link href="/sales/returns/new">
          <Button>Create Return</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Returns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : returns?.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">No returns found</div>
          ) : (
            <div className="space-y-4">
              {returns?.map((returnItem: any) => (
                <div key={returnItem.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{returnItem.transactionNumber}</h3>
                    <p className="text-sm text-neutral-500">{formatDate(returnItem.transactionDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(returnItem.amount)}</p>
                    <p className="text-sm text-neutral-500">{returnItem.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Returns;
