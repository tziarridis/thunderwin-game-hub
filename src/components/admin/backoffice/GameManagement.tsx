
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Settings, TestTube, History, Package, Server } from "lucide-react";
import GameAggregator from "@/components/admin/GameAggregator";

const GameManagement = () => {
  const [activeTab, setActiveTab] = useState("games");
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Game Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/game-aggregator')}>
            <Gamepad2 className="mr-2 h-4 w-4" />
            Game Aggregator
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/aggregator-settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Aggregator Settings
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/pp-integration-tester')}>
            <TestTube className="mr-2 h-4 w-4" />
            Test Integration
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/pp-transactions')}>
            <History className="mr-2 h-4 w-4" />
            Transactions
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6 w-[400px]">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="aggregator">Game Aggregator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Games Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage your casino games - import from providers, edit details, and organize by categories.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">Games List</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      View and manage all games in your casino
                    </p>
                    <Button onClick={() => navigate('/admin/games')}>
                      Go to Games List
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">Game Categories</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage game categories and organization
                    </p>
                    <Button onClick={() => navigate('/admin/cms/categories')}>
                      Manage Categories
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Game Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Manage your game providers and their integrations.</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Pragmatic Play</h3>
                        <p className="text-sm text-muted-foreground">Status: Active</p>
                      </div>
                      <Button variant="outline" onClick={() => navigate('/admin/pp-integration-tester')}>
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">InfinGame</h3>
                        <p className="text-sm text-muted-foreground">Status: Active</p>
                      </div>
                      <Button variant="outline" onClick={() => navigate('/admin/infingame-tester')}>
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center flex-col h-full items-center justify-center">
                      <Server className="h-12 w-12 text-muted-foreground mb-2" />
                      <Button variant="outline" onClick={() => navigate('/admin/aggregator-settings')}>
                        Add Provider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aggregator">
          <GameAggregator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameManagement;
