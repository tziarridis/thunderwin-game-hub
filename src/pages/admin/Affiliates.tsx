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
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { Affiliate } from "@/types";

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
      status: "active" as const, // Explicitly type as one of the allowed values
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Affiliate Program</h1>
          <p className="text-gray-400">Manage and track your affiliate partners</p>
        </div>
        
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
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Total Affiliates" 
          value={affiliates.length.toString()} 
          description="Active affiliate partners"
          icon={<Users className="h-5 w-5" />}
          trend={"+12% from last month"}
        />
        <StatsCard 
          title="Total Signups" 
          value={affiliates.reduce((acc, curr) => acc + curr.signups, 0).toString()} 
          description="From referral links"
          icon={<BarChart3 className="h-5 w-5" />}
          trend={"+8% from last month"}
        />
        <StatsCard 
          title="Revenue Generated" 
          value={`$${affiliates.reduce((acc, curr) => acc + curr.totalRevenue, 0).toLocaleString()}`} 
          description="Total affiliate revenue"
          icon={<DollarSign className="h-5 w-5" />}
          trend={"+22% from last month"}
        />
      </div>
      
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
                        <DropdownMenuItem onClick={() => toast.info("Edit feature coming soon")}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(affiliate.id)}>
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          {affiliate.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyReferralLink(affiliate.referralCode)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Stats view coming soon")}>
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
