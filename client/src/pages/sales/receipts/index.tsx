import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';

const Receipts = () => {
  const { data: receipts, isLoading } = useQuery({
    queryKey: ['salesReceipts'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?type=sales_receipt');
      return response.json();
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Sales Receipts</h1>
          <p className="text-sm text-neutral-500">Manage your sales receipts</p>
        </div>
        <Link href="/sales/receipts/new">
          <Button>Create Receipt</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : receipts?.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">No receipts found</div>
          ) : (
            <div className="space-y-4">
              {receipts?.map((receipt: any) => (
                <div key={receipt.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{receipt.transactionNumber}</h3>
                    <p className="text-sm text-neutral-500">{formatDate(receipt.transactionDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(receipt.amount)}</p>
                    <p className="text-sm text-neutral-500">{receipt.status}</p>
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

export default Receipts;