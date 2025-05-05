
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CasinoAggregatorSettings from "@/components/admin/CasinoAggregatorSettings";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight, Home, Settings, Globe, PlusCircle } from "lucide-react";

const AggregatorSettings = () => {
  const [activeTab, setActiveTab] = useState("casino");

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard">
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/game-management">Game Management</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Aggregator Settings</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Game Aggregator Settings</h1>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Aggregator
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="casino">Casino Aggregators</TabsTrigger>
          <TabsTrigger value="sports">Sports Aggregators</TabsTrigger>
          <TabsTrigger value="live">Live Dealer Aggregators</TabsTrigger>
        </TabsList>
        
        <TabsContent value="casino" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Available Casino Aggregators
              </CardTitle>
              <CardDescription>
                Configure your casino game aggregators for multiple providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CasinoAggregatorSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sports Aggregators</CardTitle>
              <CardDescription>Configure your sports betting aggregators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No sports aggregators configured yet</p>
                <Button>Add Sports Aggregator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Dealer Aggregators</CardTitle>
              <CardDescription>Configure your live dealer game aggregators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No live dealer aggregators configured yet</p>
                <Button>Add Live Dealer Aggregator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AggregatorSettings;
