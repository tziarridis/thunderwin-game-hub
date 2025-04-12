
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Affiliate } from "@/types";
import { BarChart, PieChart } from "@/components/ui/chart";
import AffiliateStats from "@/components/admin/AffiliateStats";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clipboard, Copy, Edit, Plus, Trash } from "lucide-react";

// Generate mock affiliate data
const generateMockAffiliates = () => {
  const mockAffiliates = [];
  
  for (let i = 1; i <= 20; i++) {
    const status: 'active' | 'pending' | 'suspended' = 
      i % 3 === 0 ? 'suspended' : i % 5 === 0 ? 'pending' : 'active';
    
    mockAffiliates.push({
      id: `AFF-${1000 + i}`,
      userId: `user${i}`,
      userName: `User ${i}`,
      name: `Affiliate ${i}`,
      email: `affiliate${i}@example.com`,
      website: i % 2 === 0 ? `https://affiliate${i}.com` : undefined,
      code: `THUNDER${1000 + i}`,
      referredUsers: Math.floor(Math.random() * 50),
      totalCommissions: Math.floor(Math.random() * 5000),
      commission: 20 + (i % 10),
      signups: Math.floor(Math.random() * 100),
      totalRevenue: Math.floor(Math.random() * 10000),
      joinedDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      payoutMethod: i % 3 === 0 ? 'PayPal' : i % 4 === 0 ? 'Bank Transfer' : 'Crypto',
      payoutDetails: `Payment details for affiliate ${i}`,
      status: status,
      joined: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      referralCode: `REF${1000 + i}`
    });
  }
  
  return mockAffiliates;
};

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "code",
    header: "Referral Code",
    cell: (row: Affiliate) => (
      <div className="flex items-center space-x-2">
        <span>{row.code}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(row.code);
          }}
        >
          <Clipboard className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: "referredUsers",
    header: "Referred Users",
  },
  {
    accessorKey: "totalCommissions",
    header: "Total Commissions",
    cell: (row: Affiliate) => `$${row.totalCommissions}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (row: Affiliate) => {
      let badgeColor = "bg-green-500";
      if (row.status === "pending") {
        badgeColor = "bg-yellow-500";
      } else if (row.status === "suspended") {
        badgeColor = "bg-red-500";
      }
      return <Badge className={badgeColor}>{row.status}</Badge>;
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (row: Affiliate) => (
      <div className="relative flex justify-end items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4 mr-2" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Affiliate</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];

const AffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "pending" | "suspended" | "all"
  >("all");

  useEffect(() => {
    // Load affiliates from localStorage or generate if none exist
    const storedAffiliates = localStorage.getItem("affiliates");
    if (storedAffiliates) {
      setAffiliates(JSON.parse(storedAffiliates));
    } else {
      const mockAffiliates = generateMockAffiliates();
      localStorage.setItem("affiliates", JSON.stringify(mockAffiliates));
      setAffiliates(mockAffiliates);
    }
  }, []);

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      searchQuery === "" ||
      affiliate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || affiliate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Prepare data for charts
  const statusCounts = affiliates.reduce(
    (acc, affiliate) => {
      acc[affiliate.status]++;
      return acc;
    },
    { active: 0, pending: 0, suspended: 0 }
  );

  const statusData = [
    { name: "Active", value: statusCounts.active },
    { name: "Pending", value: statusCounts.pending },
    { name: "Suspended", value: statusCounts.suspended },
  ];

  const topAffiliates = [...affiliates]
    .sort((a, b) => b.totalCommissions - a.totalCommissions)
    .slice(0, 5);

  const topAffiliatesData = topAffiliates.map((affiliate) => ({
    name: affiliate.name,
    value: affiliate.totalCommissions,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Affiliate Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Affiliate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="thunder-card">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Search affiliates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as "active" | "pending" | "suspended" | "all"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="thunder-card">
          <CardHeader>
            <CardTitle>Affiliate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={statusData} />
          </CardContent>
        </Card>

        <Card className="thunder-card">
          <CardHeader>
            <CardTitle>Top Affiliates by Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={topAffiliatesData} 
              index="name"
              categories={["value"]}
            />
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={filteredAffiliates} />
    </div>
  );
};

export default AffiliatesPage;
