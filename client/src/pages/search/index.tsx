import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Search as SearchIcon, 
  Store, 
  Package, 
  Building2,
  ShoppingCart,
  LayoutGrid
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Party, Item } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'wouter';

const Search = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('marketplace');
  
  // Fetch parties for search
  const { data: parties, isLoading: partiesLoading } = useQuery<Party[]>({
    queryKey: ['/api/parties'],
    enabled: searchType === 'parties',
  });
  
  // Fetch items for search
  const { data: items, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['/api/items'],
    enabled: searchType === 'items',
  });
  
  // Filter based on search term
  const filteredParties = parties?.filter(party => 
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.gstin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Marketplace & Search</h1>
        <p className="text-sm text-neutral-500">Find products, suppliers and manage your marketplace listings</p>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search across products, vendors and your listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button>
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="marketplace" className="w-full" onValueChange={setSearchType}>
        <TabsList className="mb-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="parties">Parties Search</TabsTrigger>
          <TabsTrigger value="items">Products Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marketplace">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Product Catalog</CardTitle>
                </div>
                <CardDescription>Browse and search marketplace products</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  Discover new products from verified vendors with detailed information, images, and competitive pricing.
                </p>
                <Button asChild className="w-full">
                  <Link href="/search/products">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Vendor Directory</CardTitle>
                </div>
                <CardDescription>Find and connect with vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  Discover new suppliers, manufacturers, and service providers with detailed profiles and contact information.
                </p>
                <Button asChild className="w-full">
                  <Link href="/search/vendors">
                    <Building2 className="h-4 w-4 mr-2" />
                    Find Vendors
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">My Listings</CardTitle>
                </div>
                <CardDescription>Manage your marketplace offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  Create, edit, and manage your product listings on the marketplace with detailed analytics and visibility.
                </p>
                <Button asChild className="w-full">
                  <Link href="/search/my-listings">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Manage Listings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Popular products from our marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {items?.slice(0, 4).map(item => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 bg-neutral-100 flex items-center justify-center">
                        <Package className="h-12 w-12 text-neutral-300" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-neutral-800 line-clamp-1">{item.name}</h3>
                        {item.category && (
                          <p className="text-xs text-neutral-500 mt-1">{item.category}</p>
                        )}
                        <div className="mt-3">
                          <span className="font-semibold text-primary">
                            {formatCurrency(Number(item.sellingPrice) || 0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="parties">
          <Card>
            <CardHeader>
              <CardTitle>Customers & Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              {partiesLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredParties && filteredParties.length > 0 ? (
                <div className="space-y-4">
                  {filteredParties.map(party => (
                    <div key={party.id} className="border rounded-md p-4 hover:bg-neutral-50">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{party.name}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {party.type === 'customer' ? 'Customer' : 
                           party.type === 'vendor' ? 'Vendor' : 'Customer & Vendor'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-neutral-500">{party.gstin}</div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>{party.city}{party.state ? `, ${party.state}` : ''}</span>
                        <span className="font-medium">Credit Limit: {formatCurrency(Number(party.creditLimit))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  {searchTerm ? 'No parties found matching your search criteria.' : 'Enter search criteria to find parties.'}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <Button variant="outline" className="mr-2" asChild>
              <Link href="/finance/receivables/customers">
                View All Customers
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/finance/payables/vendors">
                View All Vendors
              </Link>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Products & Items</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array(5).fill(null).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredItems.map(item => (
                    <div key={item.id} className="border rounded-md p-4 hover:bg-neutral-50">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {item.category || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-neutral-500">HSN: {item.hsnCode || 'N/A'}</div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span>Stock: {item.openingStock} {item.unit}</span>
                        <span className="font-medium">Price: {formatCurrency(Number(item.sellingPrice))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  {searchTerm ? 'No items found matching your search criteria.' : 'Enter search criteria to find items.'}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href="/inventory/stock-items/list">
                View All Inventory Items
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Search;