import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

const DeliveryNotes = () => {
  const { data: deliveryNotes, isLoading } = useQuery({
    queryKey: ['transactions', 'delivery_note'],
    queryFn: async () => {
      const response = await fetch('/api/transactions?type=delivery_note');
      return response.json();
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Delivery Notes</h1>
          <p className="text-sm text-neutral-500">Manage your delivery notes</p>
        </div>
        <Link href="/sales/delivery-notes/new">
          <Button>Create Delivery Note</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Delivery Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : deliveryNotes?.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">No delivery notes found</div>
          ) : (
            <div className="space-y-4">
              {deliveryNotes?.map((note: any) => (
                <div key={note.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{note.transactionNumber}</h3>
                    <p className="text-sm text-neutral-500">{formatDate(note.transactionDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">{note.status}</p>
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

export default DeliveryNotes;