import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserCircle, Building, Users, ServerCog, Plus } from 'lucide-react';
// These will be implemented later
const CustomersList = () => (
  <div className="py-10 text-center">
    <h2 className="text-xl font-semibold mb-4">Customers List</h2>
    <p className="text-neutral-500">Customer management will be implemented in a future update.</p>
  </div>
);

const VendorsList = () => (
  <div className="py-10 text-center">
    <h2 className="text-xl font-semibold mb-4">Vendors List</h2>
    <p className="text-neutral-500">Vendor management will be implemented in a future update.</p>
  </div>
);

const ProfileSettings = () => (
  <div className="py-10 text-center">
    <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
    <p className="text-neutral-500">Company profile settings will be implemented in a future update.</p>
  </div>
);

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('customers');
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Master Data</h1>
          <p className="text-sm text-neutral-500">Manage your customers, vendors, and company settings</p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          {activeTab === 'customers' && (
            <Link href="/master-data/customers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          )}
          {activeTab === 'vendors' && (
            <Link href="/master-data/vendors/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="customers" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto mb-6">
          <TabsTrigger value="customers" className="flex items-center">
            <UserCircle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger value="company-profile" className="flex items-center">
            <ServerCog className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Company Profile</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers">
          <CustomersList />
        </TabsContent>
        
        <TabsContent value="vendors">
          <VendorsList />
        </TabsContent>
        
        <TabsContent value="company-profile">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MasterData;