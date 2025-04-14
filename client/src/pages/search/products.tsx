import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Filter, Tag, ShoppingCart, Heart } from 'lucide-react';
import { Item } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured'); // popularity, price-low, price-high
  const [view, setView] = useState('grid'); // grid or list

  // Get all marketplace items from the API
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/marketplace/items'],
  });

  // Get categories from products
  const categories = [...new Set(products.map((product: Item) => product.listingCategory).filter(Boolean))] as string[];

  // Filter and sort products based on search term, price range, categories, and sort by
  const filteredProducts = products
    .filter((product: Item) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (product.listingDescription && product.listingDescription.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPrice = product.sellingPrice && 
                          parseFloat(product.sellingPrice) >= priceRange[0] && 
                          parseFloat(product.sellingPrice) <= priceRange[1];
      
      const matchesCategory = selectedCategories.length === 0 || 
                             (product.listingCategory && selectedCategories.includes(product.listingCategory));
      
      return matchesSearch && matchesPrice && matchesCategory;
    })
    .sort((a: Item, b: Item) => {
      if (sortBy === 'featured') {
        return (b.featuredProduct ? 1 : 0) - (a.featuredProduct ? 1 : 0);
      } else if (sortBy === 'popularity') {
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      } else if (sortBy === 'price-low') {
        return parseFloat(a.sellingPrice || '0') - parseFloat(b.sellingPrice || '0');
      } else if (sortBy === 'price-high') {
        return parseFloat(b.sellingPrice || '0') - parseFloat(a.sellingPrice || '0');
      }
      return 0;
    });

  // Display featured products at the top
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['/api/marketplace/featured'],
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center mb-6 justify-between gap-4">
        <h1 className="text-3xl font-bold">Product Search</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter sidebar */}
        <div className="bg-card rounded-lg p-4 shadow-sm border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Filter size={16} /> Filters
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Price Range</h4>
              <Slider
                defaultValue={priceRange}
                max={50000}
                step={1000}
                onValueChange={setPriceRange}
                className="my-4"
              />
              <div className="flex justify-between items-center text-sm">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>
            
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
          {/* Featured products section */}
          {featuredProducts.length > 0 && !searchTerm && selectedCategories.length === 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product: Item) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
          
          {/* Main products listing */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-muted-foreground">{filteredProducts.length} products found</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
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
            <div className="text-center py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              Error loading products. Please try again.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([0, 50000]);
                  setSelectedCategories([]);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={view === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "flex flex-col gap-4"
            }>
              {filteredProducts.map((product: Item) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, view = 'grid' }: { product: Item, view?: string }) {
  const renderStarRating = (rating: string | null) => {
    if (!rating) return null;
    const ratingNum = parseFloat(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${
              i < Math.floor(ratingNum) ? 'text-yellow-400 fill-yellow-400' : 
              i < ratingNum ? 'text-yellow-400 fill-yellow-400 opacity-50' : 
              'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm ml-1 text-muted-foreground">
          ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  if (view === 'list') {
    return (
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
        <div className="relative h-[120px] aspect-square">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
              No Image
            </div>
          )}
          {product.featuredProduct && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between mb-2">
            <div>
              <h3 className="font-medium text-lg">{product.name}</h3>
              {product.brandName && <p className="text-sm text-muted-foreground">{product.brandName}</p>}
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(parseFloat(product.sellingPrice || '0'))}</p>
              {product.mrp && parseFloat(product.mrp) > parseFloat(product.sellingPrice || '0') && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(parseFloat(product.mrp))}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.listingDescription || product.description}
          </p>
          
          <div className="mt-auto flex justify-between items-center">
            {renderStarRating(product.ratings)}
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-secondary text-secondary-foreground">
            No Image
          </div>
        )}
        {product.featuredProduct && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Featured
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
        </div>
        {product.brandName && <p className="text-sm text-muted-foreground">{product.brandName}</p>}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.listingDescription || product.description}
        </p>
        {product.listingTags && product.listingTags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {product.listingTags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col">
            <p className="font-semibold">{formatCurrency(parseFloat(product.sellingPrice || '0'))}</p>
            {product.mrp && parseFloat(product.mrp) > parseFloat(product.sellingPrice || '0') && (
              <p className="text-sm text-muted-foreground line-through">
                {formatCurrency(parseFloat(product.mrp))}
              </p>
            )}
          </div>
          {renderStarRating(product.ratings)}
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button className="flex-1" size="sm">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}