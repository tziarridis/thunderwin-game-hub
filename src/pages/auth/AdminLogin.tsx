
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Home, Shield, User, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication status with useEffect
  useEffect(() => {
    console.log("AdminLogin - Checking auth state:", { isAuthenticated, isAdmin: isAdmin() });
    
    // Only redirect if already authenticated as admin
    if (isAuthenticated && isAdmin()) {
      console.log("AdminLogin - Already authenticated as admin, redirecting to dashboard");
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (values: AdminLoginValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("AdminLogin - Login attempt with:", values.username);
    
    try {
      // Call the adminLogin function
      const result = await adminLogin(values.username, values.password);
      
      console.log("AdminLogin - Login result:", result);
      
      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }
      
      // Navigate to dashboard after successful login
      // Let the Auth Context handle the navigation to avoid race conditions
      
    } catch (error: any) {
      console.error("AdminLogin - Login failed:", error);
      toast.error(error.message || "Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center border-b border-slate-700">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-casino-thunder-green" />
              <div className="border-l border-slate-600 h-10 mx-1"></div>
              <Link to="/">
                <img 
                  src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
                  alt="ThunderWin" 
                  className="h-8 thunder-glow"
                />
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to your administration account</p>
          </div>
          
          <div className="px-6 py-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Username</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-white/40" />
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Enter admin username" 
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockKeyhole className="h-5 w-5 text-white/40" />
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter admin password" 
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium py-2.5 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Access Admin Panel
                    </>
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm text-white/70 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <span>Demo credentials: username: "admin", password: "admin"</span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="w-full text-white/70 hover:text-white border-slate-600 hover:bg-slate-700 hover:border-slate-500"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Casino
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
