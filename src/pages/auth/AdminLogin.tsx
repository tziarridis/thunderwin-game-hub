
import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Loader2, Home, Shield } from "lucide-react";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (values: AdminLoginValues) => {
    setIsSubmitting(true);
    try {
      await adminLogin(values.username, values.password);
    } catch (error) {
      console.error("Admin login failed:", error);
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
        
        <div className="flex items-center justify-center mb-6">
          <Shield className="text-casino-thunder-green h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold text-white text-center">Admin Access</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter admin username" {...field} />
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
                    <Input type="password" placeholder="Enter admin password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : "Access Admin Panel"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-sm text-white/70">
          <span>Credentials: username: "admin", password: "admin"</span>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="text-white hover:text-casino-thunder-green"
          >
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Casino
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
