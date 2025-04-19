
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Loader2, Home, Shield, Mail, LockKeyhole } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: "Login successful",
        description: "Welcome to ThunderWin Casino!",
      });
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-casino-thunder-darker to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-casino-thunder-dark border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center border-b border-white/10">
            <Link to="/" className="inline-block">
              <img 
                src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
                alt="ThunderWin" 
                className="h-12 thunder-glow mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/60">Sign in to your account to continue</p>
          </div>
          
          <div className="px-6 py-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-white/40" />
                        </div>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="pl-10 bg-white/5 border-white/10 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green" 
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
                            placeholder="Enter your password" 
                            className="pl-10 bg-white/5 border-white/10 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-casino-thunder-green focus:ring-casino-thunder-green"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                      Remember me
                    </label>
                  </div>
                  
                  <Link to="/forgot-password" className="text-sm text-casino-thunder-green hover:text-casino-thunder-highlight transition-colors">
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium py-2.5 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 text-center text-sm text-white/60">
              <span>Don't have an account?</span>
              <Link to="/auth/register" className="ml-1 text-casino-thunder-green hover:text-casino-thunder-highlight transition-colors font-medium">
                Create Account
              </Link>
            </div>
            
            <div className="mt-3 text-center text-xs text-white/40">
              Demo account: demo@example.com / password123
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="text-white/70 hover:text-white border-white/10 hover:bg-white/5 hover:border-white/20"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="text-white/70 hover:text-yellow-400 border-white/10 hover:bg-white/5 hover:border-yellow-400/30"
              >
                <Link to="/admin/login">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
