
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, PlusCircle, Settings, Users, Database, BarChart3, CreditCard } from "lucide-react";

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/new-game-aggregator">
          <Card className="h-full transition-all hover:border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-500" />
                New Game Aggregator
              </CardTitle>
              <CardDescription>
                Unified game aggregator with seamless wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mb-4">
                Manage multiple game providers, handle callbacks, and track transactions with our new unified API.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Open Aggregator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/casino/aggregator-seamless">
          <Card className="h-full transition-all hover:border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-green-500" />
                Seamless Wallet
              </CardTitle>
              <CardDescription>
                Manage the seamless wallet integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mb-4">
                Monitor transactions, test wallet operations, and verify callback handling for the game aggregator.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Open Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/game-aggregator">
          <Card className="h-full transition-all hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                Legacy Game Aggregator
              </CardTitle>
              <CardDescription>
                Manage game provider integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mb-4">
                Configure and test individual game provider integrations with the legacy aggregator.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Open Legacy Aggregator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/pp-integration-tester">
          <Card className="h-full transition-all hover:border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-yellow-500" />
                PP Integration Tester
              </CardTitle>
              <CardDescription>
                Test Pragmatic Play integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70 mb-4">
                Run tests and validate the Pragmatic Play API integration with logging and diagnostics.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Open Integration Tester
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="h-full transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-slate-500" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70 mb-4">
              Add, edit, and remove user accounts. Set permissions and roles for admin access.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        
        <Card className="h-full transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5 text-slate-500" />
              Add New Module
            </CardTitle>
            <CardDescription>
              Extend the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70 mb-4">
              Create and add new administrative modules to extend functionality.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
