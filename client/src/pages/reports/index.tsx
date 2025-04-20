
import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('financial');

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Reports</h1>
          <p className="text-sm text-neutral-500">View detailed business reports and analysis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/reports/balance-sheet">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Balance Sheet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">View assets, liabilities and equity</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/reports/profit-loss">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Profit & Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Income, expenses and profitability analysis</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/cash-flow">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Track money movement in and out of business</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/reports/sales/by-customer">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Sales by Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Customer-wise sales analysis</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/sales/by-item">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Sales by Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Product-wise sales breakdown</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/sales/by-period">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Sales by Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Time-based sales trends</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/reports/purchases/by-vendor">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Purchases by Vendor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Vendor-wise purchase analysis</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/purchases/by-item">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Purchases by Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Product-wise purchase breakdown</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/purchases/by-period">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Purchases by Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Time-based purchase trends</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/reports/inventory/stock-summary">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Stock Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Current stock levels overview</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/inventory/stock-movement">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Stock Movement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Track inventory ins and outs</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports/inventory/stock-valuation">
              <Card className="h-full hover:bg-neutral-50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">Stock Valuation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">Value of current inventory</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
