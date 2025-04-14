import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TallySyncLog } from '@shared/schema';
import { formatDate } from '@/lib/utils';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  // Fetch tally sync logs for the sync history tab
  const { data: syncLogs, isLoading: syncLogsLoading } = useQuery<TallySyncLog[]>({
    queryKey: ['/api/tally-sync/logs'],
    enabled: activeTab === 'tallySync',
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Settings</h1>
        <p className="text-sm text-neutral-500">Configure your platform settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Manage your application settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tallySync">Tally Sync</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="users">Users & Permissions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" defaultValue="Trivedi & Sons" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input id="gstin" defaultValue="22AAAAA0000A1Z5" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="demo@example.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="9876543210" />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" defaultValue="123 Business Hub, Commercial Area" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="Mumbai" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="Maharashtra" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" defaultValue="400001" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="darkMode" className="cursor-pointer">Dark Mode</Label>
                      <Switch id="darkMode" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications" className="cursor-pointer">Enable Email Notifications</Label>
                      <Switch id="emailNotifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smsNotifications" className="cursor-pointer">Enable SMS Notifications</Label>
                      <Switch id="smsNotifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoSync" className="cursor-pointer">Auto-sync with Tally</Label>
                      <Switch id="autoSync" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tallySync">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tally Integration Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tallyPath">Tally Path</Label>
                      <Input id="tallyPath" defaultValue="C:\Tally.ERP9" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tallyVersion">Tally Version</Label>
                      <Input id="tallyVersion" defaultValue="Tally ERP 9" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                      <Input id="syncInterval" type="number" defaultValue="60" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTransactions">Max Transactions per Sync</Label>
                      <Input id="maxTransactions" type="number" defaultValue="100" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncSales" className="cursor-pointer">Sync Sales</Label>
                      <Switch id="syncSales" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncPurchases" className="cursor-pointer">Sync Purchases</Label>
                      <Switch id="syncPurchases" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncPayments" className="cursor-pointer">Sync Payments</Label>
                      <Switch id="syncPayments" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncReceipts" className="cursor-pointer">Sync Receipts</Label>
                      <Switch id="syncReceipts" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="syncItems" className="cursor-pointer">Sync Inventory Items</Label>
                      <Switch id="syncItems" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sync History</h3>
                  
                  {syncLogsLoading ? (
                    <div className="animate-pulse space-y-2">
                      {Array(3).fill(null).map((_, i) => (
                        <div key={i} className="bg-neutral-100 h-12 rounded-md"></div>
                      ))}
                    </div>
                  ) : syncLogs && syncLogs.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date & Time</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Transactions</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Details</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {syncLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {formatDate(log.syncedAt)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.syncType === 'pull' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                  {log.syncType === 'pull' ? 'Pull from Tally' : 'Push to Tally'}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${log.syncStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.syncStatus === 'success' ? 'Success' : 'Failed'}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {log.transactionCount || 0}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-500">
                                {log.details}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-neutral-50 rounded-md">
                      <p className="text-neutral-500">No sync history available</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Test Connection</Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Gateway</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gatewayProvider">Payment Gateway Provider</Label>
                      <select id="gatewayProvider" className="w-full border border-neutral-300 rounded-md h-10 px-3">
                        <option value="razorpay">Razorpay</option>
                        <option value="paytm">Paytm</option>
                        <option value="stripe">Stripe</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input id="apiKey" type="password" defaultValue="••••••••••••••••" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secretKey">Secret Key</Label>
                      <Input id="secretKey" type="password" defaultValue="••••••••••••••••" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input id="webhookUrl" defaultValue="https://yourdomain.com/api/webhook" readOnly />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">BNPL Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bnplProvider">BNPL Provider</Label>
                      <select id="bnplProvider" className="w-full border border-neutral-300 rounded-md h-10 px-3">
                        <option value="internal">Internal Credit</option>
                        <option value="jocata">Jocata Finance</option>
                        <option value="credfit">CredFit</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                      <Input id="defaultInterestRate" type="number" step="0.01" defaultValue="1.5" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxCreditPeriod">Maximum Credit Period (days)</Label>
                      <Input id="maxCreditPeriod" type="number" defaultValue="90" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minCreditScore">Minimum Credit Score</Label>
                      <Input id="minCreditScore" type="number" defaultValue="650" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableBNPL" className="cursor-pointer">Enable BNPL for Customers</Label>
                      <Switch id="enableBNPL" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableVendorBNPL" className="cursor-pointer">Enable BNPL for Vendors</Label>
                      <Switch id="enableVendorBNPL" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoApprove" className="cursor-pointer">Auto-approve BNPL Requests</Label>
                      <Switch id="autoApprove" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">User Management</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Role</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium">
                                AD
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">Admin User</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            admin@example.com
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Administrator
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                        
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center font-medium">
                                AC
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">Accountant</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            accountant@example.com
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Accountant
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Add User</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Role Permissions</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Permission</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Administrator</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Accountant</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Sales</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">Purchase</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">View Dashboard</td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                        </tr>
                        
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">Manage Sales</td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                        </tr>
                        
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">Manage Purchases</td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                        </tr>
                        
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">Sync with Tally</td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                        </tr>
                        
                        <tr className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">Manage Users</td>
                          <td className="px-4 py-3 text-center">
                            <Switch defaultChecked />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Switch />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="invoiceEmail" className="block">Invoice Created</Label>
                        <p className="text-xs text-neutral-500">Send email when a new invoice is created</p>
                      </div>
                      <Switch id="invoiceEmail" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="paymentEmail" className="block">Payment Received</Label>
                        <p className="text-xs text-neutral-500">Send email when a payment is received</p>
                      </div>
                      <Switch id="paymentEmail" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="overdueEmail" className="block">Invoice Overdue</Label>
                        <p className="text-xs text-neutral-500">Send email when an invoice becomes overdue</p>
                      </div>
                      <Switch id="overdueEmail" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="syncEmail" className="block">Tally Sync Failed</Label>
                        <p className="text-xs text-neutral-500">Send email when Tally sync fails</p>
                      </div>
                      <Switch id="syncEmail" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">SMS Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="invoiceSms" className="block">Invoice Created</Label>
                        <p className="text-xs text-neutral-500">Send SMS when a new invoice is created</p>
                      </div>
                      <Switch id="invoiceSms" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="paymentSms" className="block">Payment Received</Label>
                        <p className="text-xs text-neutral-500">Send SMS when a payment is received</p>
                      </div>
                      <Switch id="paymentSms" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="overdueSms" className="block">Invoice Overdue</Label>
                        <p className="text-xs text-neutral-500">Send SMS when an invoice becomes overdue</p>
                      </div>
                      <Switch id="overdueSms" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="lowStockNotify" className="block">Low Stock Alert</Label>
                        <p className="text-xs text-neutral-500">Show notification when inventory is below minimum level</p>
                      </div>
                      <Switch id="lowStockNotify" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="approvalNotify" className="block">Approval Required</Label>
                        <p className="text-xs text-neutral-500">Show notification when a document needs approval</p>
                      </div>
                      <Switch id="approvalNotify" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="bnplNotify" className="block">BNPL Limit Alerts</Label>
                        <p className="text-xs text-neutral-500">Show notification when BNPL limit exceeds 80%</p>
                      </div>
                      <Switch id="bnplNotify" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
