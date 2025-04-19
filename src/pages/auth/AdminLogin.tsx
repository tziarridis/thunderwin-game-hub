
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Shield, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Since this is a mock, we'll use a hardcoded check for "admin/admin"
      if (username === "admin" && password === "admin") {
        // Call the login function from auth context with isAdmin flag
        await login({ username, password, isAdmin: true });
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
          variant: "default",
        });
        
        navigate("/admin");
      } else {
        toast({
          title: "Access denied",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="bg-casino-thunder-dark p-8 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 hover:text-white"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to site
            </Button>
            
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-casino-thunder-green mr-2" />
              <span className="text-sm font-medium text-white/70">Admin Only</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="p-3 rounded-full bg-casino-thunder-green/10 border border-casino-thunder-green/20">
              <Lock className="h-10 w-10 text-casino-thunder-green" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6 text-white">Admin Access</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter admin username"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-white/50">This is a secure area for administrators only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
