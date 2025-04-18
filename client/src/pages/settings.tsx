import { useState } from 'react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Database, BellRing, Shield, Server, Laptop } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate settings save
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      });
    }, 1000);
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-neutral-800">System Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-64">
            <CardContent className="p-4">
              <TabsList className="flex flex-col h-auto gap-2">
                <TabsTrigger value="general" className="w-full justify-start">
                  <Laptop className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="api" className="w-full justify-start">
                  <Server className="h-4 w-4 mr-2" />
                  API Settings
                </TabsTrigger>
                <TabsTrigger value="database" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="notifications" className="w-full justify-start">
                  <BellRing className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <div className="flex-1">
            <TabsContent value="general" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage general application settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="system-name">System Name</Label>
                      <Input id="system-name" defaultValue="High Court Digitization System" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="court-name">Court Name</Label>
                      <Input id="court-name" defaultValue="Delhi High Court" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Display Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="items-per-page">Items Per Page</Label>
                        <Select defaultValue="10">
                          <SelectTrigger id="items-per-page">
                            <SelectValue placeholder="Select items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 items</SelectItem>
                            <SelectItem value="10">10 items</SelectItem>
                            <SelectItem value="25">25 items</SelectItem>
                            <SelectItem value="50">50 items</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-format">Date Format</Label>
                        <Select defaultValue="dd-mm-yyyy">
                          <SelectTrigger id="date-format">
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                            <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                            <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-refresh" defaultChecked />
                    <Label htmlFor="auto-refresh">Enable auto-refresh for dashboard and lists</Label>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>API Settings</CardTitle>
                  <CardDescription>Configure external API integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Court Database API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="court-api-url">API URL</Label>
                        <Input id="court-api-url" defaultValue="https://api.court.gov.in/v1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="court-api-key">API Key</Label>
                        <Input id="court-api-key" type="password" defaultValue="••••••••••••••••" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">DSpace Repository API</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dspace-url">DSpace URL</Label>
                        <Input id="dspace-url" defaultValue="https://dspace.highcourt.gov.in/rest" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dspace-credentials">Authentication</Label>
                        <Select defaultValue="basic">
                          <SelectTrigger id="dspace-credentials">
                            <SelectValue placeholder="Select auth method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                            <SelectItem value="token">Token Based</SelectItem>
                            <SelectItem value="oauth">OAuth 2.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dspace-username">Username</Label>
                        <Input id="dspace-username" defaultValue="api_user" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dspace-password">Password</Label>
                        <Input id="dspace-password" type="password" defaultValue="••••••••••••••••" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Database Settings</CardTitle>
                  <CardDescription>Configure database connection settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="db-host">Database Host</Label>
                      <Input id="db-host" defaultValue="localhost" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="db-port">Database Port</Label>
                      <Input id="db-port" defaultValue="5432" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="db-name">Database Name</Label>
                      <Input id="db-name" defaultValue="digitization_db" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="db-user">Database User</Label>
                      <Input id="db-user" defaultValue="digitization_user" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="db-password">Database Password</Label>
                    <Input id="db-password" type="password" defaultValue="••••••••••••••••" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="use-ssl" defaultChecked />
                    <Label htmlFor="use-ssl">Use SSL connection</Label>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure system notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-server">SMTP Server</Label>
                        <Input id="smtp-server" defaultValue="smtp.highcourt.gov.in" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input id="smtp-port" defaultValue="587" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email-from">From Email</Label>
                        <Input id="email-from" defaultValue="digitization@highcourt.gov.in" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-admin">Admin Email</Label>
                        <Input id="email-admin" defaultValue="admin@highcourt.gov.in" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Preferences</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-receipt">File Receipt</Label>
                        <p className="text-sm text-neutral-500">Send notifications when new files are received</p>
                      </div>
                      <Switch id="notify-receipt" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-handover">File Handover</Label>
                        <p className="text-sm text-neutral-500">Send notifications when files are handed over</p>
                      </div>
                      <Switch id="notify-handover" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-upload">Upload Completion</Label>
                        <p className="text-sm text-neutral-500">Send notifications when uploads are completed</p>
                      </div>
                      <Switch id="notify-upload" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notify-delay">Delay Alerts</Label>
                        <p className="text-sm text-neutral-500">Send alerts when files are delayed in processing</p>
                      </div>
                      <Switch id="notify-delay" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and access control</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Password Policy</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="min-password-length">Minimum Password Length</Label>
                      </div>
                      <Select defaultValue="8">
                        <SelectTrigger id="min-password-length" className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="password-complexity">Require Complex Password</Label>
                        <p className="text-sm text-neutral-500">Upper/lowercase, numbers, and special characters</p>
                      </div>
                      <Switch id="password-complexity" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                      </div>
                      <Select defaultValue="90">
                        <SelectTrigger id="password-expiry" className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="60">60</SelectItem>
                          <SelectItem value="90">90</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Session Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger id="session-timeout" className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="60">60</SelectItem>
                          <SelectItem value="120">120</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="login-attempts">Max Login Attempts</Label>
                      </div>
                      <Select defaultValue="5">
                        <SelectTrigger id="login-attempts" className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enable-2fa">Enable Two-Factor Authentication</Label>
                      </div>
                      <Switch id="enable-2fa" />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
