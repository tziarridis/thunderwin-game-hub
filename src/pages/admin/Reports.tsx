
import React from 'react';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialReport from '@/components/admin/reports/FinancialReport';
import GamePerformanceReport from '@/components/admin/reports/GamePerformanceReport';
import PlayerActivityReport from '@/components/admin/reports/PlayerActivityReport';

const AdminReportsPage = () => {
  return (
    <AdminPageLayout title="Reports & Analytics">
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="game_performance">Game Performance</TabsTrigger>
          <TabsTrigger value="player_activity">Player Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialReport />
        </TabsContent>
        <TabsContent value="game_performance">
          <GamePerformanceReport />
        </TabsContent>
        <TabsContent value="player_activity">
          <PlayerActivityReport />
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default AdminReportsPage;
