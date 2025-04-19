
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
import { Loader2, Home, User, Mail, LockKeyhole, KeyRound } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type RegisterValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      await register(values.email, values.username, values.password);
      
      // Store user in localStorage for admin panel
      const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const newUserId = `USR-${1000 + mockUsers.length + 1}`;
      
      const newUser = {
        id: newUserId,
        name: values.username,
        username: values.username,
        email: values.email,
        status: 'Active',
        balance: 0,
        joined: new Date().toISOString().split('T')[0],
        favoriteGames: [],
        role: 'user',
        vipLevel: 0,
        isVerified: false
      };
      
      mockUsers.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
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
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-sm text-white/60">Join ThunderWin to start playing</p>
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
                            placeholder="Choose a username" 
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
                            placeholder="Create a password" 
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Confirm Password</FormLabel>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-white/40" />
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your password" 
                            className="pl-10 bg-white/5 border-white/10 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green" 
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-2">
                  <p className="text-xs text-white/50">
                    By creating an account, you agree to our <Link to="/legal/terms" className="text-casino-thunder-green hover:underline">Terms of Service</Link> and <Link to="/legal/privacy" className="text-casino-thunder-green hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium py-2.5 mt-2 transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-8 text-center text-sm text-white/60">
              <span>Already have an account?</span>
              <Link to="/auth/login" className="ml-1 text-casino-thunder-green hover:text-casino-thunder-highlight transition-colors font-medium">
                Sign In
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="w-full text-white/70 hover:text-white border-white/10 hover:bg-white/5 hover:border-white/20"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
