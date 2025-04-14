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
import { Search, Filter, MapPin, Tag, BadgeCheck, Star, Phone, Mail } from 'lucide-react';
import { Party } from '@shared/schema';

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('name'); // name, recently-added, rating
  const [view, setView] = useState('grid'); // grid or list

  // Get all vendors from the API
  const { data: parties = [], isLoading, error } = useQuery({
    queryKey: ['/api/parties'],
  });

  // Filter vendors to only get vendor type
  const vendors = parties.filter((party: Party) => party.type === 'vendor');

  // Get unique states from vendors
  const states = [...new Set(vendors.map((vendor: Party) => vendor.state).filter(Boolean))] as string[];

  // Filter and sort vendors based on search term, categories, states, and verification status
  const filteredVendors = vendors
    .filter((vendor: Party) => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesState = selectedStates.length === 0 || 
                          (vendor.state && selectedStates.includes(vendor.state));
      
      const matchesVerification = verified === null || vendor.gstin !== null;
      
      return matchesSearch && matchesState && matchesVerification;
    })
    .sort((a: Party, b: Party) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'recently-added') {
        // Sort by creation date, newest first
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center mb-6 justify-between gap-4">
        <h1 className="text-3xl font-bold">Vendor Search</h1>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
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
              <h4 className="font-medium mb-2">States</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {states.map((state) => (
                  <div key={state} className="flex items-center gap-2">
                    <Checkbox 
                      id={`state-${state}`}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStates(prev => [...prev, state]);
                        } else {
                          setSelectedStates(prev => prev.filter(s => s !== state));
                        }
                      }}
                    />
                    <Label htmlFor={`state-${state}`}>{state}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Verification</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="verified"
                    checked={verified === true}
                    onCheckedChange={(checked) => {
                      setVerified(checked ? true : null);
                    }}
                  />
                  <Label htmlFor="verified">GSTIN Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="all-vendors"
                    checked={verified === null}
                    onCheckedChange={(checked) => {
                      setVerified(checked ? null : false);
                    }}
                  />
                  <Label htmlFor="all-vendors">All Vendors</Label>
                </div>
              </div>
            </div>
            
            {selectedStates.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 flex-wrap">
                  {selectedStates.map(state => (
                    <Badge key={state} variant="outline" className="flex gap-1 items-center">
                      {state}
                      <button 
                        onClick={() => setSelectedStates(prev => prev.filter(s => s !== state))}
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
                  onClick={() => setSelectedStates([])}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          {/* Main vendors listing */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-muted-foreground">{filteredVendors.length} vendors found</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
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
            <div className="text-center py-10">Loading vendors...</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              Error loading vendors. Please try again.
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No vendors found. Try adjusting your filters.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStates([]);
                  setVerified(null);
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
              {filteredVendors.map((vendor: Party) => (
                <VendorCard key={vendor.id} vendor={vendor} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorCard({ vendor, view = 'grid' }: { vendor: Party, view?: string }) {
  if (view === 'list') {
    return (
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
        <div className="w-20 bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{vendor.name.charAt(0)}</span>
        </div>
        <div className="p-4 flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{vendor.name}</h3>
                {vendor.gstin && (
                  <Badge variant="outline" className="text-xs font-normal">
                    <BadgeCheck className="h-3 w-3 mr-1" /> GSTIN Verified
                  </Badge>
                )}
              </div>
              {vendor.contactPerson && (
                <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {vendor.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{vendor.phone}</span>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{vendor.email}</span>
              </div>
            )}
            {vendor.city && vendor.state && (
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{vendor.city}, {vendor.state}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline">View Profile</Button>
            <Button size="sm" variant="default">Contact</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="h-24 bg-primary/10 flex items-center justify-center">
        <span className="text-4xl font-bold text-primary">{vendor.name.charAt(0)}</span>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{vendor.name}</CardTitle>
            {vendor.contactPerson && (
              <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
            )}
          </div>
          {vendor.gstin && (
            <Badge variant="outline" className="text-xs font-normal">
              <BadgeCheck className="h-3 w-3 mr-1" /> GSTIN Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="space-y-1 text-sm">
          {vendor.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.phone}</span>
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{vendor.email}</span>
            </div>
          )}
          {vendor.city && vendor.state && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.city}, {vendor.state}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" size="sm">
          View Profile
        </Button>
        <Button className="flex-1" size="sm">
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}