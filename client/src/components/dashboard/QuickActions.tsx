import { Link } from "wouter";

const QuickActions = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-neutral-800 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Link href="/sales">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">New Sale</span>
          </div>
        </Link>
        
        <Link href="/purchases">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">New Purchase</span>
          </div>
        </Link>
        
        <Link href="/finance/receivables/customers">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">Record Receipt</span>
          </div>
        </Link>
        
        <Link href="/finance/payables/vendors">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">Record Payment</span>
          </div>
        </Link>
        
        <Link href="/inventory/stock-items">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">Add Inventory</span>
          </div>
        </Link>
        
        <Link href="/reports">
          <div className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-medium text-neutral-700">Reports</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
