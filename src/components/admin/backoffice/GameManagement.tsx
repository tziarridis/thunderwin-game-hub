
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameAggregator from "@/components/admin/GameAggregator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Settings, TestTube, History } from "lucide-react";

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
      
      <Tabs defaultValue="games" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6 w-[400px]">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Games Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage your casino games - import from providers, edit details, and organize by categories.</p>
              
              <div className="mt-4">
                <Button onClick={() => navigate('/admin/games')}>
                  Go to Games List
                </Button>
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
              <p>Manage your game providers and their integrations.</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
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
                        <h3 className="text-lg font-semibold">Game Aggregator</h3>
                        <p className="text-sm text-muted-foreground">Status: Active</p>
                      </div>
                      <Button variant="outline" onClick={() => navigate('/admin/game-aggregator')}>
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Game Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage game categories and their organization.</p>
              
              <div className="mt-4">
                <Button onClick={() => navigate('/admin/cms/categories')}>
                  Manage Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameManagement;
