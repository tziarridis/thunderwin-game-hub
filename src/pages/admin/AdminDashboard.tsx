
import React, { useState } from 'react';
import { BarChart3, Users, Wallet, Gift, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 8472,
    activeUsers: 3689,
    totalRevenue: 924675,
    newRegistrations: 128,
    bonusesClaimed: 256,
    pendingWithdrawals: 42,
    kycPending: 18,
    activeBets: 1237
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Welcome to the Captain Admin dashboard. View key metrics and manage your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-casino-thunder-green" />
              Users
            </CardTitle>
            <CardDescription className="text-slate-400">Active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-slate-400 text-sm">
              Total Registered: {stats.totalUsers.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-casino-thunder-green" />
              Revenue
            </CardTitle>
            <CardDescription className="text-slate-400">Total platform revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${(stats.totalRevenue/1000).toFixed(1)}k</div>
            <p className="text-slate-400 text-sm">
              ${(stats.totalRevenue/30000).toFixed(1)}k daily average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Gift className="mr-2 h-5 w-5 text-casino-thunder-green" />
              Bonuses
            </CardTitle>
            <CardDescription className="text-slate-400">Claimed bonus promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.bonusesClaimed}</div>
            <p className="text-slate-400 text-sm">
              In the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-casino-thunder-green" />
              KYC
            </CardTitle>
            <CardDescription className="text-slate-400">Pending verifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.kycPending}</div>
            <p className="text-slate-400 text-sm">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "alex473", action: "Completed KYC", time: "5 minutes ago" },
                { user: "jack_smith", action: "Made a withdrawal of $500", time: "15 minutes ago" },
                { user: "maria99", action: "Claimed a bonus", time: "32 minutes ago" },
                { user: "poker_king", action: "Reported an issue", time: "1 hour ago" },
                { user: "vegas_player", action: "Made a deposit of $1000", time: "2 hours ago" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <div>
                    <p className="font-medium text-white">{item.user}</p>
                    <p className="text-sm text-slate-400">{item.action}</p>
                  </div>
                  <div className="text-sm text-slate-500">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Platform Status</CardTitle>
            <CardDescription className="text-slate-400">Current system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Game servers", status: "Operational", indicator: "bg-green-500" },
                { name: "Payment gateway", status: "Operational", indicator: "bg-green-500" },
                { name: "KYC verification", status: "Operational", indicator: "bg-green-500" },
                { name: "API services", status: "Degraded performance", indicator: "bg-yellow-500" },
                { name: "Live casino", status: "Operational", indicator: "bg-green-500" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full ${item.indicator} mr-2`}></div>
                    <p className="font-medium text-white">{item.name}</p>
                  </div>
                  <div className="text-sm text-slate-400">{item.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
