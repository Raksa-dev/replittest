import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tag, Eye, Edit, MoreVertical, Plus, Search, Settings, ChevronRight, Star, ShoppingBag, HeartOff, Heart, Check, X } from 'lucide-react';
import { Item } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export default function MyListingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [listingStatus, setListingStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest'); // newest, alphabetical, price-low, price-high
  const [view, setView] = useState('grid'); // grid or list
  const queryClient = useQueryClient();

  // Get all user's items
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['/api/items'],
  });

  // For simplicity, this is a frontend filter of items that have listing information
  // In a real app, you would have a separate endpoint for this
  interface MarketplaceItem extends Item {
    isListed: boolean;
    listingDescription: string;
    marketplaceImages?: string[];
    listingStatus: 'active' | 'inactive' | 'pending';
    listingTags: string[];
    listingCategory: string;
  }

  // Filter items to get only those with marketplace information
  const myItems = items
    .filter((item: Item) => item.isListed !== undefined)
    .map((item: Item) => ({
      ...item,
      isListed: item.isListed || false,
      listingDescription: item.listingDescription || '',
      marketplaceImages: item.imageUrls || [item.imageUrl].filter(Boolean),
      listingStatus: item.listingStatus || 'inactive',
      listingTags: item.listingTags || [],
      listingCategory: item.listingCategory || item.category || 'Uncategorized'
    })) as MarketplaceItem[];

  // Get categories from products
  const categories = [...new Set(myItems.map(item => item.listingCategory).filter(Boolean))] as string[];

  // Filter items based on search, categories, and listing status
  const filteredItems = myItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.listingDescription && item.listingDescription.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategories.length === 0 || 
        (item.listingCategory && selectedCategories.includes(item.listingCategory));
      
      const matchesStatus = 
        listingStatus === null || 
        item.listingStatus === listingStatus || 
        (listingStatus === 'active' && item.isListed === true) ||
        (listingStatus === 'inactive' && item.isListed === false);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price-low') {
        return parseFloat(a.sellingPrice || '0') - parseFloat(b.sellingPrice || '0');
      } else if (sortBy === 'price-high') {
        return parseFloat(b.sellingPrice || '0') - parseFloat(a.sellingPrice || '0');
      }
      return 0;
    });

  // Mutation for toggling listing status
  const toggleListingMutation = useMutation({
    mutationFn: async (item: MarketplaceItem) => {
      const updatedItem = {
        ...item,
        isListed: !item.isListed,
        listingStatus: !item.isListed ? 'active' : 'inactive'
      };
      
      return apiRequest({
        method: 'PATCH',
        url: `/api/marketplace/items/${item.id}`,
        body: JSON.stringify(updatedItem)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    }
  });

  const handleToggleListing = (item: MarketplaceItem) => {
    toggleListingMutation.mutate(item);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center mb-6 justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Marketplace Listings</h1>
          <p className="text-muted-foreground">Manage your product listings in the marketplace</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} /> New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
                <DialogDescription>
                  Turn your inventory item into a marketplace listing
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-muted-foreground mb-4">
                  Choose an inventory item to list on the marketplace:
                </p>
                {/* Here would be a form to select an inventory item and add listing details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item">Inventory Item</Label>
                    <Select>
                      <SelectTrigger id="item">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items
                          .filter((item: Item) => !item.isListed)
                          .map((item: Item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="listing-description">Listing Description</Label>
                    <Textarea 
                      id="listing-description" 
                      placeholder="Describe your product for the marketplace..." 
                      className="h-24"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input 
                      id="tags" 
                      placeholder="e.g. organic, local, premium" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input 
                      id="image-url" 
                      placeholder="https://example.com/image.jpg" 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="featured" />
                    <Label htmlFor="featured">Mark as featured product</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Listing</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search my listings..."
              className="pl-8 w-[200px] md:w-[260px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter sidebar */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Settings size={16} /> Listing Settings
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="status-all"
                    checked={listingStatus === null}
                    onCheckedChange={(checked) => {
                      setListingStatus(checked ? null : 'active');
                    }}
                  />
                  <Label htmlFor="status-all">All Listings</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="status-active"
                    checked={listingStatus === 'active'}
                    onCheckedChange={(checked) => {
                      setListingStatus(checked ? 'active' : null);
                    }}
                  />
                  <Label htmlFor="status-active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="status-inactive"
                    checked={listingStatus === 'inactive'}
                    onCheckedChange={(checked) => {
                      setListingStatus(checked ? 'inactive' : null);
                    }}
                  />
                  <Label htmlFor="status-inactive">Inactive</Label>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories(prev => [...prev, category]);
                        } else {
                          setSelectedCategories(prev => prev.filter(cat => cat !== category));
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedCategories.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 flex-wrap">
                  {selectedCategories.map(cat => (
                    <Badge key={cat} variant="outline" className="flex gap-1 items-center">
                      {cat}
                      <button 
                        onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => setSelectedCategories([])}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          {/* Listings control bar */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-muted-foreground">{filteredItems.length} listing{filteredItems.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="alphabetical">A to Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Tabs value={view} className="hidden md:block" onValueChange={setView}>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">Loading your listings...</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              Error loading listings. Please try again.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="flex flex-col items-center gap-2 mb-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No listings found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategories.length > 0 || listingStatus
                    ? "Try adjusting your filters or create a new listing."
                    : "You don't have any marketplace listings yet. Create your first listing to get started!"}
                </p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Listing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Listing</DialogTitle>
                    <DialogDescription>
                      Turn your inventory item into a marketplace listing
                    </DialogDescription>
                  </DialogHeader>
                  {/* Dialog content similar to the one above */}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className={view === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "flex flex-col gap-4"
            }>
              {filteredItems.map((item) => (
                <ListingCard 
                  key={item.id} 
                  item={item} 
                  view={view} 
                  onToggleListing={() => handleToggleListing(item)}
                  isToggling={toggleListingMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ListingCardProps {
  item: {
    id: number;
    name: string;
    sellingPrice?: string | null;
    isListed: boolean;
    listingStatus: string;
    listingDescription?: string;
    listingCategory?: string;
    listingTags?: string[];
    imageUrl?: string | null;
    imageUrls?: string[] | null;
    featuredProduct?: boolean;
    mrp?: string | null;
    discountPercentage?: string | null;
    ratings?: string | null;
    reviewCount?: number | null;
  };
  view?: string;
  onToggleListing: () => void;
  isToggling: boolean;
}

function ListingCard({ item, view = 'grid', onToggleListing, isToggling }: ListingCardProps) {
  if (view === 'list') {
    return (
      <div className="flex bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="w-24 h-24 relative">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
              No Image
            </div>
          )}
          {!item.isListed && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="outline" className="bg-black/70 text-white border-white">
                Inactive
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{item.listingDescription}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  disabled={isToggling}
                  onClick={onToggleListing}
                  className="h-8 w-8"
                >
                  {item.isListed ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Listing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="font-semibold mt-2">{formatCurrency(parseFloat(item.sellingPrice || '0'))}</p>
              {item.mrp && parseFloat(item.mrp) > parseFloat(item.sellingPrice || '0') && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(parseFloat(item.mrp))}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            {item.listingCategory && (
              <Badge variant="secondary" className="text-xs">
                {item.listingCategory}
              </Badge>
            )}
            
            <div className="flex items-center text-sm">
              {item.ratings && (
                <div className="flex items-center mr-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{item.ratings} ({item.reviewCount || 0})</span>
                </div>
              )}
              
              <Badge variant={item.isListed ? "success" : "secondary"} className="text-xs">
                {item.isListed ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all">
      <div className="relative aspect-video">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
            No Image
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={onToggleListing}
            disabled={isToggling}
          >
            {item.isListed ? (
              <X className="h-4 w-4 text-destructive" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit Listing
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {!item.isListed && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-black/70 text-white border-white">
              Inactive
            </Badge>
          </div>
        )}
        
        {item.featuredProduct && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-primary/90 hover:bg-primary/90">
              Featured
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <div className="flex flex-col items-end">
            <p className="font-semibold">{formatCurrency(parseFloat(item.sellingPrice || '0'))}</p>
            {item.mrp && parseFloat(item.mrp) > parseFloat(item.sellingPrice || '0') && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(parseFloat(item.mrp))}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {item.listingDescription}
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          {item.listingCategory && (
            <Badge variant="secondary" className="text-xs">
              {item.listingCategory}
            </Badge>
          )}
        </div>
        
        {item.listingTags && item.listingTags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {item.listingTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            )).slice(0, 3)}
            {item.listingTags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.listingTags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {item.ratings && (
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm">{item.ratings}</span>
            <span className="text-xs text-muted-foreground ml-1">({item.reviewCount || 0})</span>
          </div>
        )}
        
        <Badge 
          variant={item.isListed ? "success" : "secondary"} 
          className="px-2 py-0.5 h-6"
        >
          {item.isListed ? "Active" : "Inactive"}
        </Badge>
      </CardFooter>
    </Card>
  );
}