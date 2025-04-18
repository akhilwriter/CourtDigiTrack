import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Save, Trash2, ServerCog, Database, Key } from "lucide-react";

export default function Settings() {
  const [selectedTab, setSelectedTab] = useState("users");
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  return (
    <div className="space-y-6 pt-14">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
        <p className="mt-1 text-sm text-gray-600">Manage system settings and user accounts</p>
      </div>
      
      <Tabs defaultValue="users" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">User Accounts</h3>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users?.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.active ? "success" : "destructive"}>
                              {user.active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm" className="mr-2">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ServerCog className="mr-2 h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="appName">Application Name</Label>
                    <Input 
                      id="appName" 
                      defaultValue="High Court Document Digitization System" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataSyncInterval">Data Sync Interval (minutes)</Label>
                    <Input 
                      id="dataSyncInterval" 
                      type="number"
                      defaultValue="15" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select defaultValue="Asia/Kolkata">
                      <SelectTrigger id="timeZone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoLogout">Auto Logout (minutes of inactivity)</Label>
                    <Input 
                      id="autoLogout" 
                      type="number"
                      defaultValue="30"
                      className="w-24" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableNotifications">Enable Notifications</Label>
                      <p className="text-sm text-gray-500">Show notifications for system events</p>
                    </div>
                    <Switch id="enableNotifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableLogging">Enable Detailed Logging</Label>
                      <p className="text-sm text-gray-500">Record detailed operation logs</p>
                    </div>
                    <Switch id="enableLogging" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Court Database Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiEndpoint">API Endpoint URL</Label>
                    <Input 
                      id="apiEndpoint" 
                      defaultValue="https://api.court.gov.in/v1" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apiKey" className="flex items-center">
                      <Key className="mr-1 h-4 w-4" />
                      API Key
                    </Label>
                    <Input 
                      id="apiKey" 
                      type="password"
                      defaultValue="●●●●●●●●●●●●●●●●●●●●" 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="connectTimeout">Connection Timeout (seconds)</Label>
                    <Input 
                      id="connectTimeout" 
                      type="number"
                      defaultValue="30" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableSync">Enable Auto-Sync</Label>
                      <p className="text-sm text-gray-500">Automatically sync data with court database</p>
                    </div>
                    <Switch id="enableSync" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>DSpace Repository Integration</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dspaceUrl">DSpace Repository URL</Label>
                    <Input 
                      id="dspaceUrl" 
                      defaultValue="https://dspace.highcourt.gov.in" 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dspaceCollection">Default Collection</Label>
                    <Input 
                      id="dspaceCollection" 
                      defaultValue="123e4567-e89b-12d3-a456-426614174000" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6 flex justify-end">
                <Button variant="outline" className="mr-2">
                  Test Connection
                </Button>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
