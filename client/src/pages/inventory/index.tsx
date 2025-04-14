import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, Boxes, FolderTree, Warehouse, LayoutGrid, Plus, ArrowRight } from 'lucide-react';
import StockItemsList from './stock-items/list';
import StockGroupsList from './stock-groups/list';
import GodownsList from './godowns/list';
import UnitsList from './units/list';
import { formatCurrency } from '@/lib/utils';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch inventory summary data
  const { data: inventorySummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/inventory/summary'],
  });
  
  // Fetch recent stock items
  const { data: recentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/inventory/items', { recent: true, limit: 5 }],
  });
  
  // Dashboard cards
  const InventorySummaryCard = ({ title, value, icon, className, loading }: { 
    title: string;
    value: string | number;
    icon: React.ReactNode;
    className?: string;
    loading: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-neutral-100 rounded animate-pulse mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold mt-1">{value}</h3>
            )}
          </div>
          <div className={`p-3 rounded-full ${className || 'bg-blue-100'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Inventory Management</h1>
          <p className="text-sm text-neutral-500">Track stock items, manage godowns, and monitor inventory levels</p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          {activeTab === 'stock-items' && (
            <Link href="/inventory/stock-items/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Item
              </Button>
            </Link>
          )}
          {activeTab === 'stock-groups' && (
            <Link href="/inventory/stock-groups/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock Group
              </Button>
            </Link>
          )}
          {activeTab === 'godowns' && (
            <Link href="/inventory/godowns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Godown
              </Button>
            </Link>
          )}
          {activeTab === 'units' && (
            <Link href="/inventory/units/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="stock-items" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Items</span>
          </TabsTrigger>
          <TabsTrigger value="stock-groups" className="flex items-center">
            <FolderTree className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="godowns" className="flex items-center">
            <Warehouse className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Godowns</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center">
            <Boxes className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Units</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <InventorySummaryCard 
              title="Total Stock Items" 
              value={inventorySummary?.totalItems || 0}
              icon={<Package className="h-6 w-6 text-blue-700" />} 
              className="bg-blue-50"
              loading={isLoadingSummary}
            />
            <InventorySummaryCard 
              title="Total Inventory Value" 
              value={formatCurrency(inventorySummary?.totalValue || 0)} 
              icon={<Boxes className="h-6 w-6 text-green-700" />} 
              className="bg-green-50"
              loading={isLoadingSummary}
            />
            <InventorySummaryCard 
              title="Low Stock Items" 
              value={inventorySummary?.lowStockCount || 0} 
              icon={<FolderTree className="h-6 w-6 text-amber-700" />} 
              className="bg-amber-50"
              loading={isLoadingSummary}
            />
            <InventorySummaryCard 
              title="Out of Stock Items" 
              value={inventorySummary?.outOfStockCount || 0} 
              icon={<Warehouse className="h-6 w-6 text-red-700" />} 
              className="bg-red-50"
              loading={isLoadingSummary}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Items</CardTitle>
              <CardDescription>
                Recently added or updated stock items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="space-y-4">
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="flex items-center p-4 border rounded-md">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-100 rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-neutral-50 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="w-20">
                        <div className="h-6 bg-neutral-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentItems?.length > 0 ? (
                <div className="space-y-4">
                  {recentItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-neutral-50">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-neutral-500">{item.category || 'Uncategorized'} • {item.unit || 'No Unit'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <h3 className="text-lg font-medium">No stock items yet</h3>
                  <p className="text-neutral-500 mb-4">
                    Add your first stock item to start tracking inventory
                  </p>
                  <Link href="/inventory/stock-items/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stock Item
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            {recentItems?.length > 0 && (
              <CardFooter className="flex justify-end">
                <Link href="/inventory/stock-items">
                  <Button variant="outline">
                    View All Items
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>
                  Items that are below their minimum stock level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingItems ? (
                  <div className="space-y-3">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="flex justify-between p-3 border rounded-md">
                        <div className="h-5 bg-neutral-100 rounded w-1/3 animate-pulse"></div>
                        <div className="h-5 bg-neutral-100 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentItems?.filter((item: any) => 
                      item.quantityInStock && 
                      item.minStockLevel && 
                      item.quantityInStock <= item.minStockLevel
                    ).slice(0, 5).map((item: any) => (
                      <div key={item.id} className="flex justify-between p-3 border rounded-md">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-amber-600 font-medium">{item.quantityInStock} left</span>
                      </div>
                    ))}
                    {(!recentItems || recentItems.filter((item: any) => 
                      item.quantityInStock && 
                      item.minStockLevel && 
                      item.quantityInStock <= item.minStockLevel
                    ).length === 0) && (
                      <p className="text-center py-4 text-neutral-500">No low stock items</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stock Groups</CardTitle>
                <CardDescription>
                  Categories and groups for organizing inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingItems ? (
                  <div className="space-y-3">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="flex justify-between p-3 border rounded-md">
                        <div className="h-5 bg-neutral-100 rounded w-1/3 animate-pulse"></div>
                        <div className="h-5 bg-neutral-100 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* This would be populated from stock groups data */}
                    <div className="flex justify-between p-3 border rounded-md">
                      <span className="font-medium">Raw Materials</span>
                      <span className="text-neutral-500">12 items</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-md">
                      <span className="font-medium">Finished Goods</span>
                      <span className="text-neutral-500">8 items</span>
                    </div>
                    <div className="flex justify-between p-3 border rounded-md">
                      <span className="font-medium">Packaging</span>
                      <span className="text-neutral-500">5 items</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link href="/inventory/stock-groups">
                  <Button variant="outline">
                    View All Groups
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="stock-items">
          <StockItemsList />
        </TabsContent>
        
        <TabsContent value="stock-groups">
          <StockGroupsList />
        </TabsContent>
        
        <TabsContent value="godowns">
          <GodownsList />
        </TabsContent>
        
        <TabsContent value="units">
          <UnitsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;