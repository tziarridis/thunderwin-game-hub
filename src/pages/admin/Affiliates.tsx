
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  PlusCircle, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Copy, 
  BarChart, 
  ArrowUpRight,
  LineChart,
  TrendingUp,
  Link,
  UserPlus,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Affiliate } from "@/types";
import { useForm } from "react-hook-form";
import AffiliateStats from "@/components/admin/AffiliateStats";

const defaultAffiliates: Affiliate[] = [
  {
    id: "aff-001",
    name: "James Smith",
    email: "james@affiliatesite.com",
    website: "casinoaffiliates.com",
    referralCode: "JAMES10",
    commission: 30,
    signups: 145,
    totalRevenue: 8720,
    status: "active",
    joinedDate: "2023-06-12"
  },
  {
    id: "aff-002",
    name: "Maria Garcia",
    email: "maria@casinopromo.net",
    website: "casinopromo.net",
    referralCode: "MARIA25",
    commission: 35,
    signups: 89,
    totalRevenue: 4350,
    status: "active",
    joinedDate: "2023-08-03"
  },
  {
    id: "aff-003",
    name: "Robert Johnson",
    email: "robert@gamingpartners.com",
    website: "gamingpartners.com",
    referralCode: "ROB2023",
    commission: 25,
    signups: 56,
    totalRevenue: 2100,
    status: "inactive",
    joinedDate: "2023-11-18"
  }
];

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAffiliate, setNewAffiliate] = useState({
    name: "",
    email: "",
    website: "",
    commission: 25,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "stats">("list");
  
  // Form for editing affiliate
  const editForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      website: "",
      commission: 25,
    }
  });

  useEffect(() => {
    const storedAffiliates = localStorage.getItem('affiliates');
    if (storedAffiliates) {
      setAffiliates(JSON.parse(storedAffiliates));
    } else {
      setAffiliates(defaultAffiliates);
      localStorage.setItem('affiliates', JSON.stringify(defaultAffiliates));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedAffiliate) {
      editForm.reset({
        name: selectedAffiliate.name,
        email: selectedAffiliate.email,
        website: selectedAffiliate.website || "",
        commission: selectedAffiliate.commission,
      });
    }
  }, [selectedAffiliate, editForm]);
  
  const filteredAffiliates = affiliates.filter(affiliate => 
    affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    affiliate.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAffiliate({
      ...newAffiliate,
      [name]: name === "commission" ? parseInt(value) || 0 : value
    });
  };

  const handleAddAffiliate = () => {
    // Validate input
    if (!newAffiliate.name || !newAffiliate.email) {
      toast.error("Name and email are required");
      return;
    }

    const referralCode = newAffiliate.name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 1000);
    
    const affiliate: Affiliate = {
      id: `aff-${Date.now()}`,
      name: newAffiliate.name,
      email: newAffiliate.email,
      website: newAffiliate.website || undefined,
      referralCode,
      commission: newAffiliate.commission,
      signups: 0,
      totalRevenue: 0,
      status: "active" as const,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updatedAffiliates = [...affiliates, affiliate];
    setAffiliates(updatedAffiliates);
    localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
    
    setNewAffiliate({
      name: "",
      email: "",
      website: "",
      commission: 25,
    });
    
    setIsDialogOpen(false);
    toast.success("Affiliate added successfully");
  };

  const handleEditAffiliate = () => {
    if (!selectedAffiliate) return;
    
    const formValues = editForm.getValues();
    
    // Validate input
    if (!formValues.name || !formValues.email) {
      toast.error("Name and email are required");
      return;
    }

    const updatedAffiliates = affiliates.map(aff => {
      if (aff.id === selectedAffiliate.id) {
        return {
          ...aff,
          name: formValues.name,
          email: formValues.email,
          website: formValues.website || undefined,
          commission: formValues.commission,
        };
      }
      return aff;
    });
    
    setAffiliates(updatedAffiliates);
    localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
    setIsEditDialogOpen(false);
    toast.success("Affiliate updated successfully");
  };

  const handleDeleteAffiliate = (id: string) => {
    if (confirm("Are you sure you want to delete this affiliate?")) {
      const updatedAffiliates = affiliates.filter(aff => aff.id !== id);
      setAffiliates(updatedAffiliates);
      localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
      toast.success("Affiliate deleted successfully");
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedAffiliates = affiliates.map(aff => {
      if (aff.id === id) {
        const newStatus: "active" | "inactive" = aff.status === "active" ? "inactive" : "active";
        return { ...aff, status: newStatus };
      }
      return aff;
    });
    
    setAffiliates(updatedAffiliates);
    localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
    toast.success("Affiliate status updated");
  };

  const copyReferralLink = (code: string) => {
    const link = `https://yoursite.com/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard");
  };
  
  const openEditDialog = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsEditDialogOpen(true);
  };
  
  const openStatsDialog = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsStatsDialogOpen(true);
  };
  
  // Simulate updating affiliate stats
  const updateAffiliateStats = (affiliate: Affiliate) => {
    // Generate random new signups and revenue for demo purposes
    const newSignups = Math.floor(Math.random() * 5);
    const newRevenue = Math.floor(Math.random() * 500);
    
    const updatedAffiliates = affiliates.map(aff => {
      if (aff.id === affiliate.id) {
        return {
          ...aff,
          signups: aff.signups + newSignups,
          totalRevenue: aff.totalRevenue + newRevenue
        };
      }
      return aff;
    });
    
    setAffiliates(updatedAffiliates);
    localStorage.setItem('affiliates', JSON.stringify(updatedAffiliates));
    toast.success(`Stats updated: +${newSignups} signups, +$${newRevenue} revenue`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Affiliate Program</h1>
          <p className="text-gray-400">Manage and track your affiliate partners</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView(currentView === "list" ? "stats" : "list")}>
            {currentView === "list" ? <BarChart3 className="mr-2 h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
            {currentView === "list" ? "View Overall Stats" : "View List"}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Affiliate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Affiliate</DialogTitle>
                <DialogDescription>
                  Create a new affiliate partner to expand your network.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input
                    id="name"
                    name="name"
                    value={newAffiliate.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newAffiliate.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="website" className="text-sm font-medium">Website (Optional)</label>
                  <Input
                    id="website"
                    name="website"
                    value={newAffiliate.website}
                    onChange={handleInputChange}
                    placeholder="website.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="commission" className="text-sm font-medium">Commission Percentage</label>
                  <Input
                    id="commission"
                    name="commission"
                    type="number"
                    min="1"
                    max="50"
                    value={newAffiliate.commission}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={handleAddAffiliate}>Add Affiliate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Edit Affiliate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Affiliate</DialogTitle>
            <DialogDescription>
              Update the affiliate's information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={(e) => { e.preventDefault(); handleEditAffiliate(); }} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="website.com" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Percentage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="50" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Commission rate for this affiliate (1-50%)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Affiliate Statistics</DialogTitle>
            <DialogDescription>
              {selectedAffiliate?.name}'s performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {selectedAffiliate && (
            <div className="mt-4">
              <AffiliateStats affiliate={selectedAffiliate} />
              <div className="mt-4 flex justify-end">
                <Button onClick={() => updateAffiliateStats(selectedAffiliate)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Refresh Stats
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {currentView === "stats" ? (
        <div className="space-y-6">
          {/* Overall Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Total Affiliates" 
              value={affiliates.length.toString()} 
              description="Active affiliate partners"
              icon={<Users className="h-5 w-5" />}
              trend={`${Math.floor(affiliates.filter(a => a.status === "active").length / Math.max(affiliates.length, 1) * 100)}% active rate`}
            />
            <StatsCard 
              title="Total Signups" 
              value={affiliates.reduce((acc, curr) => acc + curr.signups, 0).toString()} 
              description="From referral links"
              icon={<UserPlus className="h-5 w-5" />}
              trend={"+8% from last month"}
            />
            <StatsCard 
              title="Revenue Generated" 
              value={`$${affiliates.reduce((acc, curr) => acc + curr.totalRevenue, 0).toLocaleString()}`} 
              description="Total affiliate revenue"
              icon={<DollarSign className="h-5 w-5" />}
              trend={"+22% from last month"}
            />
            <StatsCard 
              title="Avg. Commission" 
              value={`${Math.round(affiliates.reduce((acc, curr) => acc + curr.commission, 0) / Math.max(affiliates.length, 1))}%`} 
              description="Average commission rate"
              icon={<Wallet className="h-5 w-5" />}
              trend={"Industry avg: 20%"}
            />
          </div>
          
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Affiliates</CardTitle>
              <CardDescription>Affiliates generating the most revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 5)
                    .map((affiliate) => (
                      <TableRow key={`top-${affiliate.id}`}>
                        <TableCell className="font-medium">{affiliate.name}</TableCell>
                        <TableCell>{affiliate.signups}</TableCell>
                        <TableCell>${affiliate.totalRevenue.toLocaleString()}</TableCell>
                        <TableCell>{affiliate.signups > 0 ? `${Math.round((affiliate.totalRevenue / affiliate.signups) * 10) / 10}` : "0"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            affiliate.status === 'active' 
                              ? 'bg-green-900/30 text-green-400' 
                              : affiliate.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openStatsDialog(affiliate)}>
                            <BarChart className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Search and filters */}
          <div className="mb-6">
            <Input
              placeholder="Search affiliates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          {/* Affiliates Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Signups</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">Loading...</TableCell>
                  </TableRow>
                ) : filteredAffiliates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">No affiliates found</TableCell>
                  </TableRow>
                ) : (
                  filteredAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell className="font-medium">{affiliate.name}</TableCell>
                      <TableCell>{affiliate.email}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          {affiliate.referralCode}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1"
                            onClick={() => copyReferralLink(affiliate.referralCode)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </span>
                      </TableCell>
                      <TableCell>{affiliate.commission}%</TableCell>
                      <TableCell>{affiliate.signups}</TableCell>
                      <TableCell>${affiliate.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch 
                            checked={affiliate.status === "active"}
                            onCheckedChange={() => handleToggleStatus(affiliate.id)}
                            className="mr-2"
                          />
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            affiliate.status === 'active' 
                              ? 'bg-green-900/30 text-green-400' 
                              : affiliate.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{affiliate.joinedDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(affiliate)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyReferralLink(affiliate.referralCode)}>
                              <Link className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openStatsDialog(affiliate)}>
                              <BarChart className="mr-2 h-4 w-4" />
                              View Stats
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteAffiliate(affiliate.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
}

const StatsCard = ({ title, value, description, icon, trend }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground bg-primary/10 p-2 rounded-full">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-2 text-xs text-green-500 flex items-center">
        <ArrowUpRight className="h-3 w-3 mr-1" />
        {trend}
      </div>
    </CardContent>
  </Card>
);

export default Affiliates;
