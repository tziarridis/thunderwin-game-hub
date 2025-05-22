import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Upload, 
  AlertTriangle,
  FileText,
  Clock,
  CircleCheck
} from "lucide-react";
import { toast } from "sonner";
import { KycStatus, KycStatusEnum } from "@/types/kyc"; // Import KycStatusEnum
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(true);
  
  // Mock user data - in a real app this would come from context/API
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    phone: "+1 555-123-4567",
    avatarUrl: "",
    kycStatus: KycStatusEnum.NOT_SUBMITTED as KycStatus // Use Enum value and cast to type
  });
  
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  
  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };
  
  const handleSavePassword = () => {
    toast.success("Password updated successfully");
  };
  
  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };
  
  const handleSaveSecurity = () => {
    toast.success("Security settings updated");
  };
  
  const handleKycSubmit = () => {
    navigate("/kyc");
  };
  
  const getKycStatusBadge = (status: KycStatus) => {
    switch (status) {
      case KycStatusEnum.APPROVED: // Use Enum value, was KycStatus.VERIFIED
        return (
          <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm flex items-center">
            <CircleCheck className="w-4 h-4 mr-1" />
            Verified {/* UI Text */}
          </div>
        );
      case KycStatusEnum.PENDING: // Use Enum value
        return (
          <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </div>
        );
      case KycStatusEnum.REJECTED: // Use Enum value
        return (
          <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm flex items-center">
            <X className="w-4 h-4 mr-1" />
            Rejected
          </div>
        );
      case KycStatusEnum.NOT_SUBMITTED: // Explicitly handle NOT_SUBMITTED
      case KycStatusEnum.RESUBMIT: // Added RESUBMIT to default for now, can be styled separately if needed
      default:
        return (
          <div className="bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full text-sm flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Not Submitted
          </div>
        );
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          className="w-full md:w-64 space-y-4"
        >
          <div className="flex items-center space-x-4 mb-8">
            <Avatar className="h-16 w-16 hover-scale">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-casino-thunder-green/90 to-casino-thunder-green/60">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>
          
          <Tabs 
            defaultValue="account" 
            orientation="vertical" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full enhanced-tabs"
          >
            <TabsList className="flex flex-col h-auto items-stretch glass-card p-1 space-y-1">
              <TabsTrigger 
                value="account"
                className="justify-start text-left py-3 px-4"
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="justify-start text-left py-3 px-4"
              >
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="justify-start text-left py-3 px-4"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="verification"
                className="justify-start text-left py-3 px-4"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verification
              </TabsTrigger>
              <TabsTrigger 
                value="payment"
                className="justify-start text-left py-3 px-4"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 w-full"
        >
          <TabsContent value="account" className="mt-0">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={user.username} onChange={(e) => setUser({...user, username: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="text-xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Danger Zone</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="current-password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3" 
                          onClick={togglePassword}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="new-password" 
                          type={showNewPassword ? "text" : "password"} 
                          placeholder="••••••••"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full px-3" 
                          onClick={toggleNewPassword}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <Button onClick={handleSavePassword}>Update Password</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  
                  {twoFactorEnabled && (
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <p className="text-sm">
                        Two-factor authentication adds an additional layer of security to your
                        account by requiring more than just a password to sign in.
                      </p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Session Management</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      You're currently signed in on this device. Signing out will end your session.
                    </p>
                    <Button variant="outline">Sign out of all devices</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Communication Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base" htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Account Activity</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified about your account activity
                        </div>
                      </div>
                      <Switch
                        checked={loginNotifications}
                        onCheckedChange={setLoginNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Bonuses & Promotions</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified about new bonuses and promotions
                        </div>
                      </div>
                      <Switch
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification" className="mt-0">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
                <CardDescription>
                  Complete your KYC (Know Your Customer) verification process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg border">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-medium mb-1">Verification Status</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        Your current verification status is:
                      </p>
                      {getKycStatusBadge(user.kycStatus)}
                    </div>
                    
                    {user.kycStatus === KycStatusEnum.NOT_SUBMITTED && ( // Use Enum
                      <Button onClick={handleKycSubmit}>
                        Start Verification
                      </Button>
                    )}
                    
                    {user.kycStatus === KycStatusEnum.PENDING && ( // Use Enum
                      <Button variant="outline" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Verification in Progress
                      </Button>
                    )}
                    
                    {user.kycStatus === KycStatusEnum.REJECTED && ( // Use Enum
                      <Button onClick={handleKycSubmit}>
                        Retry Verification
                      </Button>
                    )}
                    
                    {user.kycStatus === KycStatusEnum.APPROVED && ( // Use Enum (was VERIFIED)
                      <Button variant="outline" disabled className="bg-green-500/10 text-green-500 border-green-200">
                        <Check className="w-4 h-4 mr-2" />
                        Verified {/* UI Text */}
                      </Button>
                    )}
                  </div>
                  
                  {user.kycStatus === KycStatusEnum.NOT_SUBMITTED && ( // Use Enum
                    <div className="bg-yellow-500/10 border border-yellow-200 rounded-md p-4 flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Verification Required</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          You need to complete KYC verification to unlock all account features including withdrawals. 
                          The verification process usually takes 24-48 hours after submission.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {user.kycStatus === KycStatusEnum.PENDING && ( // Use Enum
                    <div className="bg-blue-500/10 border border-blue-200 rounded-md p-4 flex gap-3 items-start">
                      <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-700 dark:text-blue-400">Verification In Progress</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your verification is currently being processed. This usually takes 24-48 hours.
                          You'll receive an email once your verification is complete.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-2" onClick={() => navigate("/kyc/status")}>
                          Check verification status
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {user.kycStatus === KycStatusEnum.REJECTED && ( // Use Enum
                    <div className="bg-red-500/10 border border-red-200 rounded-md p-4 flex gap-3 items-start">
                      <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400">Verification Rejected</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your verification was rejected. Please review the feedback and submit again with the correct documents.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-red-600 dark:text-red-400 mt-2" onClick={() => navigate("/kyc/status")}>
                          View rejection details
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {user.kycStatus === KycStatusEnum.APPROVED && ( // Use Enum (was VERIFIED)
                    <div className="bg-green-500/10 border border-green-200 rounded-md p-4 flex gap-3 items-start">
                      <CircleCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400">Fully Verified</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Congratulations! Your account is fully verified. You now have access to all platform features including deposits and withdrawals.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted rounded-md p-4">
                      <div className="font-medium mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Unlocked Withdrawals
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Withdraw your winnings to your preferred payment method
                      </p>
                    </div>
                    <div className="bg-muted rounded-md p-4">
                      <div className="font-medium mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Increased Limits
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Higher deposit and withdrawal limits for verified users
                      </p>
                    </div>
                    <div className="bg-muted rounded-md p-4">
                      <div className="font-medium mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Access to VIP Program
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Become eligible for our VIP program and exclusive bonuses
                      </p>
                    </div>
                    <div className="bg-muted rounded-md p-4">
                      <div className="font-medium mb-2 flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Enhanced Account Security
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Protect your account with additional security measures
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment" className="mt-0">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your payment methods and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Saved Payment Methods</h3>
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <p className="text-muted-foreground">
                      You don't have any payment methods saved yet.
                    </p>
                    <Button className="mt-4">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recent Transactions</h3>
                    <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
                      View All
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-6 rounded-lg text-center">
                    <p className="text-muted-foreground">
                      No recent transactions found.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
