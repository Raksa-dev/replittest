import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TallySyncStatusProps {
  dashboardData: any;
  isLoading: boolean;
}

const TallySyncStatus = ({ dashboardData, isLoading }: TallySyncStatusProps) => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { toast } = useToast();
  
  const [data, setData] = useState({
    recentSyncLog: undefined as any,
    pendingSyncs: {
      invoices: 0,
      payments: 0,
      receipts: 0
    }
  });

  useEffect(() => {
    if (dashboardData && !isLoading) {
      setData({
        recentSyncLog: dashboardData.recentSyncLog,
        pendingSyncs: dashboardData.pendingSyncs || { invoices: 0, payments: 0, receipts: 0 }
      });
    }
  }, [dashboardData, isLoading]);

  const handleSyncNow = async () => {
    setSyncInProgress(true);
    try {
      await apiRequest('POST', '/api/tally-sync', { syncType: 'pull' });
      toast({
        title: "Sync Successful",
        description: "Successfully synced with Tally ERP",
        variant: "default",
      });
      
      // In a real app, we would refetch the dashboard data here
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync with Tally ERP",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setSyncInProgress(false);
    }
  };

  // Format date for last sync
  const formatSyncDate = (date: string | Date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return `Today at ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Tally Sync Status</h2>
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-neutral-800">Sync Status</h3>
            <p className="text-sm text-neutral-500 mt-1">Transactions to be synced with Tally</p>
          </div>
          <button 
            className={`px-3 py-1 ${syncInProgress ? 'bg-neutral-100 text-neutral-400' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'} text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            onClick={handleSyncNow}
            disabled={syncInProgress}
          >
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
        <div className="p-4">
          {data.recentSyncLog ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md mb-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Last sync completed successfully</p>
                  <p className="text-xs text-green-700">{formatSyncDate(data.recentSyncLog.syncedAt)}</p>
                </div>
              </div>
              <span className="text-xs text-green-700 font-medium">{data.recentSyncLog.transactionCount} transactions</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">No recent sync found</p>
                  <p className="text-xs text-yellow-700">Please sync with Tally ERP</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {data.pendingSyncs.invoices > 0 && (
              <div className="flex justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Pending Invoice Sync</p>
                  <p className="text-xs text-neutral-500">{data.pendingSyncs.invoices} {data.pendingSyncs.invoices === 1 ? 'invoice' : 'invoices'} to be synced</p>
                </div>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Review & Sync
                </button>
              </div>
            )}
            
            {data.pendingSyncs.payments > 0 && (
              <div className="flex justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Pending Payment Sync</p>
                  <p className="text-xs text-neutral-500">{data.pendingSyncs.payments} {data.pendingSyncs.payments === 1 ? 'payment' : 'payments'} to be synced</p>
                </div>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Review & Sync
                </button>
              </div>
            )}
            
            {data.pendingSyncs.receipts > 0 && (
              <div className="flex justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Pending Receipt Sync</p>
                  <p className="text-xs text-neutral-500">{data.pendingSyncs.receipts} {data.pendingSyncs.receipts === 1 ? 'receipt' : 'receipts'} to be synced</p>
                </div>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Review & Sync
                </button>
              </div>
            )}
            
            {data.pendingSyncs.invoices === 0 && data.pendingSyncs.payments === 0 && data.pendingSyncs.receipts === 0 && (
              <div className="flex justify-center p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <p className="text-sm text-neutral-500">No pending transactions to sync</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TallySyncStatus;
