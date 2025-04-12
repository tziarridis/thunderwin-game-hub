import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Affiliate } from "@/types";
import { BarChart, PieChart } from "@/components/ui/chart";
import AffiliateStats from "@/components/admin/AffiliateStats"; // Fixed import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clipboard, Copy, Edit, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const AffiliatesPage = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    code: "",
    commission: 20,
    status: "active" as Affiliate["status"]
  });
  
  useEffect(() => {
    // Fetch affiliates from localStorage
    const storedAffiliates = localStorage.getItem("affiliates");
    if (storedAffiliates) {
      setAffiliates(JSON.parse(storedAffiliates));
    } else {
      // Create mock data if none exists
      const mockAffiliates: Affiliate[] = [
        {
          id: "aff-1",
          userId: "user-1",
          userName: "johndoe",
          code: "JOHN10",
          referredUsers: 24,
          totalCommissions: 1200,
          payoutMethod: "Bitcoin",
          payoutDetails: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          status: "active",
          joined: "2023-04-15T10:30:00Z",
          name: "John Doe",
          email: "john@example.com",
          website: "johndoe.com",
          commission: 20,
          signups: 24,
          totalRevenue: 6000,
          joinedDate: "2023-04-15T10:30:00Z",
          referralCode: "JOHN10"
        },
        {
          id: "aff-2",
          userId: "user-2",
          userName: "janesmith",
          code: "JANE15",
          referredUsers: 18,
          totalCommissions: 950,
          payoutMethod: "Ethereum",
          payoutDetails: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          status: "pending",
          joined: "2023-05-22T14:45:00Z",
          name: "Jane Smith",
          email: "jane@example.com",
          website: "janesmith.com",
          commission: 15,
          signups: 18,
          totalRevenue: 4750,
          joinedDate: "2023-05-22T14:45:00Z",
          referralCode: "JANE15"
        },
        {
          id: "aff-3",
          userId: "user-3",
          userName: "mikeross",
          code: "MIKE20",
          referredUsers: 32,
          totalCommissions: 1800,
          payoutMethod: "Bank Transfer",
          payoutDetails: "Citibank - 5204 7890 1234 5678",
          status: "active",
          joined: "2023-03-10T09:15:00Z",
          name: "Mike Ross",
          email: "mike@example.com",
          website: "mikeross.com",
          commission: 25,
          signups: 32,
          totalRevenue: 9000,
          joinedDate: "2023-03-10T09:15:00Z",
          referralCode: "MIKE20"
        }
      ];
      
      setAffiliates(mockAffiliates);
      localStorage.setItem("affiliates", JSON.stringify(mockAffiliates));
    }
  }, []);
  
  const handleAddAffiliate = () => {
    const newAffiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      userId: `user-${Date.now()}`,
      userName: formData.email.split("@")[0],
      code: formData.code,
      referredUsers: 0,
      totalCommissions: 0,
      payoutMethod: "Not Set",
      payoutDetails: "Not Set",
      status: formData.status,
      joined: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      website: formData.website,
      commission: formData.commission,
      signups: 0,
      totalRevenue: 0,
      joinedDate: new Date().toISOString(),
      referralCode: formData.code
    };
    
    const updatedAffiliates = [...affiliates, newAffiliate];
    setAffiliates(updatedAffiliates);
    localStorage.setItem("affiliates", JSON.stringify(updatedAffiliates));
    
    setShowCreateDialog(false);
    setFormData({
      name: "",
      email: "",
      website: "",
      code: "",
      commission: 20,
      status: "active"
    });
    
    toast({
      title: "Affiliate Added",
      description: "New affiliate has been added successfully."
    });
  };
  
  const handleEditAffiliate = () => {
    if (selectedAffiliate) {
      const updatedAffiliates = affiliates.map(aff => 
        aff.id === selectedAffiliate.id
          ? { 
              ...aff, 
              name: formData.name,
              email: formData.email,
              website: formData.website,
              code: formData.code,
              commission: formData.commission,
              status: formData.status,
              referralCode: formData.code
            }
          : aff
      );
      
      setAffiliates(updatedAffiliates);
      localStorage.setItem("affiliates", JSON.stringify(updatedAffiliates));
      
      setShowEditDialog(false);
      setSelectedAffiliate(null);
      
      toast({
        title: "Affiliate Updated",
        description: "Affiliate details have been updated successfully."
      });
    }
  };
  
  const handleDeleteAffiliate = (id: string) => {
    const updatedAffiliates = affiliates.filter(aff => aff.id !== id);
    setAffiliates(updatedAffiliates);
    localStorage.setItem("affiliates", JSON.stringify(updatedAffiliates));
    
    toast({
      title: "Affiliate Deleted",
      description: "Affiliate has been deleted successfully."
    });
  };
  
  const handleToggleStatus = (id: string) => {
    const updatedAffiliates = affiliates.map(aff => 
      aff.id === id
        ? { 
            ...aff, 
            status: aff.status === "active" ? "suspended" : "active" 
          }
        : aff
    );
    
    setAffiliates(updatedAffiliates);
    localStorage.setItem("affiliates", JSON.stringify(updatedAffiliates));
    
    toast({
      title: "Status Updated",
      description: "Affiliate status has been updated successfully."
    });
  };
  
  const openEditDialog = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setFormData({
      name: affiliate.name || "",
      email: affiliate.email || "",
      website: affiliate.website || "",
      code: affiliate.code,
      commission: affiliate.commission || 20,
      status: affiliate.status
    });
    setShowEditDialog(true);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to clipboard."
    });
  };
  
  const filteredAffiliates = affiliates.filter(aff => 
    (aff.name && aff.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (aff.email && aff.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    aff.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalSignups = affiliates.reduce((sum, aff) => sum + (aff.signups || 0), 0);
  const totalRevenue = affiliates.reduce((sum, aff) => sum + (aff.totalRevenue || 0), 0);
  const activeAffiliates = affiliates.filter(aff => aff.status === "active").length;
  const conversionRate = totalSignups > 0 ? (totalRevenue / totalSignups).toFixed(2) : 0;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Affiliate Management</h1>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
          <Plus className="mr-2 h-4 w-4" /> Add Affiliate
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Affiliates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{affiliates.length}</div>
                <p className="text-xs text-white/60">{activeAffiliates} active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSignups}</div>
                <p className="text-xs text-white/60">Through affiliate links</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-white/60">From affiliate players</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${conversionRate}</div>
                <p className="text-xs text-white/60">Avg. revenue per signup</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Affiliate</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={affiliates
                    .filter(aff => aff.totalRevenue && aff.totalRevenue > 0)
                    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                    .slice(0, 5)
                    .map(aff => ({
                      name: aff.name || aff.userName,
                      value: aff.totalRevenue || 0
                    }))}
                  index="name"
                  categories={["value"]}
                  colors={["#22c55e"]}
                  valueFormatter={(value) => `$${value}`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Signups by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { month: "Jan", signups: 12 },
                    { month: "Feb", signups: 18 },
                    { month: "Mar", signups: 24 },
                    { month: "Apr", signups: 32 },
                    { month: "May", signups: 28 },
                    { month: "Jun", signups: 36 }
                  ]}
                  index="month"
                  categories={["signups"]}
                  colors={["#3b82f6"]}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Affiliates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Joined Date</th>
                      <th className="text-right py-3 px-4">Signups</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates
                      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                      .slice(0, 5)
                      .map(aff => (
                        <tr key={aff.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4">{aff.name || aff.userName}</td>
                          <td className="py-3 px-4">{aff.email || "N/A"}</td>
                          <td className="py-3 px-4">{aff.joinedDate ? format(new Date(aff.joinedDate), 'MMM dd, yyyy') : format(new Date(aff.joined), 'MMM dd, yyyy')}</td>
                          <td className="py-3 px-4 text-right">{aff.signups || aff.referredUsers}</td>
                          <td className="py-3 px-4 text-right">${(aff.totalRevenue || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">${(aff.commission || 0) * (aff.totalRevenue || 0) / 100}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="affiliates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Affiliates List</CardTitle>
                <Input
                  placeholder="Search affiliates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Referral Code</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Commission</th>
                      <th className="text-right py-3 px-4">Signups</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAffiliates.map(aff => (
                      <tr key={aff.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4">{aff.name || aff.userName}</td>
                        <td className="py-3 px-4">{aff.email || "N/A"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <code className="bg-white/10 px-2 py-1 rounded text-sm">
                              {aff.referralCode || aff.code}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(aff.referralCode || aff.code)}
                              className="ml-2 text-white/60 hover:text-white"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded-full ${
                            aff.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : aff.status === "pending" 
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}>
                            {aff.status.charAt(0).toUpperCase() + aff.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{aff.commission || 0}%</td>
                        <td className="py-3 px-4 text-right">{aff.signups || aff.referredUsers}</td>
                        <td className="py-3 px-4 text-right">${(aff.totalRevenue || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(aff)}>
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant={aff.status === "active" ? "destructive" : "outline"} 
                              size="sm"
                              onClick={() => handleToggleStatus(aff.id)}
                            >
                              {aff.status === "active" ? "Suspend" : "Activate"}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteAffiliate(aff.id)}>
                              <Trash size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics">
          <AffiliateStats />
        </TabsContent>
      </Tabs>
      
      {/* Create Affiliate Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Affiliate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referral Code</label>
              <Input 
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as Affiliate["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAffiliate} className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">Add Affiliate</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Affiliate Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Affiliate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referral Code</label>
              <Input 
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as Affiliate["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditAffiliate} className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliatesPage;
