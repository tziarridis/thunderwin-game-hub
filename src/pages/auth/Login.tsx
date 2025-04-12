
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
import { Loader2, Home } from "lucide-react";

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
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 flex flex-col items-center bg-casino-thunder-darker">
      <div className="w-full max-w-md px-6 py-8 bg-casino-thunder-dark rounded-lg shadow-lg border border-white/5">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
              alt="ThunderWin" 
              className="h-10 thunder-glow"
            />
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-casino-thunder-green focus:ring-casino-thunder-green"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                  Remember me
                </label>
              </div>
              
              <Link to="/forgot-password" className="text-sm text-casino-thunder-green hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
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
        
        <div className="mt-6 text-center text-sm text-white/70">
          Don't have an account?{" "}
          <Link to="/register" className="text-casino-thunder-green hover:underline">
            Create Account
          </Link>
        </div>
        
        <div className="mt-6 text-center text-xs text-white/50">
          Demo account: demo@example.com / password123
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="text-white hover:text-casino-thunder-green"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
