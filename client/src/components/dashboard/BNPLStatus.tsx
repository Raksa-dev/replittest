import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BnplLimit } from '@shared/schema';

interface BNPLStatusProps {
  dashboardData: any;
  isLoading: boolean;
}

const BNPLStatus = ({ dashboardData, isLoading }: BNPLStatusProps) => {
  const [data, setData] = useState({
    purchaseBnplLimits: [] as BnplLimit[],
    salesBnplLimits: [] as BnplLimit[]
  });

  useEffect(() => {
    if (dashboardData && !isLoading) {
      setData({
        purchaseBnplLimits: dashboardData.purchaseBnplLimits || [],
        salesBnplLimits: dashboardData.salesBnplLimits || []
      });
    }
  }, [dashboardData, isLoading]);

  // Get the first purchase and sales BNPL limit for display
  const purchaseLimit = data.purchaseBnplLimits[0] || { totalLimit: "250000", usedLimit: "150000", expiryDate: new Date() };
  const salesLimit = data.salesBnplLimits[0] || { totalLimit: "350000", usedLimit: "225000", expiryDate: new Date() };

  // Calculate usage percentages
  const purchaseUsagePercent = Number(purchaseLimit.totalLimit) > 0 
    ? Math.round((Number(purchaseLimit.usedLimit) / Number(purchaseLimit.totalLimit)) * 100) 
    : 0;
    
  const salesUsagePercent = Number(salesLimit.totalLimit) > 0 
    ? Math.round((Number(salesLimit.usedLimit) / Number(salesLimit.totalLimit)) * 100) 
    : 0;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-neutral-800 mb-3">BNPL Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchase BNPL */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium text-neutral-800">Purchase BNPL</h3>
            <p className="text-sm text-neutral-500 mt-1">Buy Now, Pay Later for purchases</p>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Limit Utilized</span>
                <span className="font-medium text-neutral-800 font-mono">
                  {formatCurrency(Number(purchaseLimit.usedLimit))} / {formatCurrency(Number(purchaseLimit.totalLimit))}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ width: `${purchaseUsagePercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">Upcoming Payments</h4>
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-neutral-200 rounded w-20 mb-1 ml-auto"></div>
                      <div className="h-3 bg-neutral-200 rounded w-16 ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-20"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-neutral-200 rounded w-20 mb-1 ml-auto"></div>
                      <div className="h-3 bg-neutral-200 rounded w-16 ml-auto"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Bharath Electronics</p>
                      <p className="text-xs text-neutral-500">Due: 28 Apr 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium font-mono text-neutral-800">₹65,000</p>
                      <button className="text-xs text-primary-600 hover:text-primary-700">Pay Now</button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Ashok Suppliers</p>
                      <p className="text-xs text-neutral-500">Due: 15 May 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium font-mono text-neutral-800">₹85,000</p>
                      <button className="text-xs text-primary-600 hover:text-primary-700">Pay Now</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sales BNPL */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium text-neutral-800">Sales BNPL</h3>
            <p className="text-sm text-neutral-500 mt-1">Sell Now, Get Paid Later status</p>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Limit Extended</span>
                <span className="font-medium text-neutral-800 font-mono">
                  {formatCurrency(Number(salesLimit.usedLimit))} / {formatCurrency(Number(salesLimit.totalLimit))}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-secondary-500 h-2 rounded-full" 
                  style={{ width: `${salesUsagePercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-4">
              <h4 className="text-sm font-medium text-neutral-600 mb-2">Sales with BNPL</h4>
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-neutral-200 rounded w-20 mb-1 ml-auto"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24 ml-auto"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-20"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-neutral-200 rounded w-20 mb-1 ml-auto"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24 ml-auto"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">GlobalTech Solutions</p>
                      <p className="text-xs text-neutral-500">Due: 18 May 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium font-mono text-neutral-800">₹1,25,000</p>
                      <button className="text-xs text-secondary-600 hover:text-secondary-700">Get Early Payment</button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Patel Enterprises</p>
                      <p className="text-xs text-neutral-500">Due: 10 Jun 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium font-mono text-neutral-800">₹1,00,000</p>
                      <button className="text-xs text-secondary-600 hover:text-secondary-700">Get Early Payment</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BNPLStatus;
