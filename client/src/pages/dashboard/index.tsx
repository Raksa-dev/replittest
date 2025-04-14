import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '@/types';
import StatsSummary from '@/components/dashboard/StatsSummary';
import QuickActions from '@/components/dashboard/QuickActions';
import AgeingAnalysis from '@/components/dashboard/AgeingAnalysis';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import BNPLStatus from '@/components/dashboard/BNPLStatus';
import TallySyncStatus from '@/components/dashboard/TallySyncStatus';
import { periodOptions } from '@/lib/utils';

const Dashboard = () => {
  const [periodFilter, setPeriodFilter] = useState<string>("30days");
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodFilter(e.target.value);
    // In a real app, we would fetch data based on the period
    // refetch with new period parameter
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
          <p className="text-sm text-neutral-500">Overview of your business transactions</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select 
              className="pl-3 pr-8 py-2 border border-neutral-300 rounded-md text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={periodFilter}
              onChange={handlePeriodChange}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500 absolute right-2 top-2.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          <button className="flex items-center justify-center px-4 py-2 bg-secondary-500 text-white rounded-md text-sm font-medium hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Sync with Tally
          </button>
          
          <div className="relative inline-block text-left">
            <button className="flex items-center justify-center p-2 border border-neutral-300 rounded-md bg-white text-neutral-700 hover:bg-neutral-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
          <p className="text-sm mt-1">Failed to load dashboard data. Please try again later.</p>
        </div>
      ) : (
        <>
          <StatsSummary dashboardData={data} isLoading={isLoading} />
          <QuickActions />
          <AgeingAnalysis dashboardData={data} isLoading={isLoading} />
          <RecentTransactions dashboardData={data} isLoading={isLoading} />
          <BNPLStatus dashboardData={data} isLoading={isLoading} />
          <TallySyncStatus dashboardData={data} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
