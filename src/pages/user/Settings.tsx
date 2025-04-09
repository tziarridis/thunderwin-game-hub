
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield,
  Mail,
  Smartphone,
  CheckSquare,
  Save,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
        <div className="container mx-auto px-4">
          <div className="thunder-card p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-white/70 mb-6">Please sign in to view your settings.</p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Tabs */}
          <div className="thunder-card p-4 lg:sticky lg:top-24 self-start">
            <div className="space-y-1">
              <SettingsTab 
                icon={<User size={18} />} 
                label="Account" 
                isActive={activeTab === "account"} 
                onClick={() => setActiveTab("account")}
              />
              <SettingsTab 
                icon={<Lock size={18} />} 
                label="Security" 
                isActive={activeTab === "security"} 
                onClick={() => setActiveTab("security")}
              />
              <SettingsTab 
                icon={<Bell size={18} />} 
                label="Notifications" 
                isActive={activeTab === "notifications"} 
                onClick={() => setActiveTab("notifications")}
              />
              <SettingsTab 
                icon={<Globe size={18} />} 
                label="Preferences" 
                isActive={activeTab === "preferences"} 
                onClick={() => setActiveTab("preferences")}
              />
              <SettingsTab 
                icon={<Shield size={18} />} 
                label="Responsible Gaming" 
                isActive={activeTab === "responsible-gaming"} 
                onClick={() => setActiveTab("responsible-gaming")}
              />
            </div>
          </div>
          
          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="thunder-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <User className="mr-2 text-casino-thunder-green" />
                  Account Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Username</label>
                      <Input 
                        value={user?.username} 
                        disabled 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                      <p className="text-white/50 text-xs mt-1">Username cannot be changed</p>
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Email Address</label>
                      <Input 
                        type="email"
                        defaultValue={user?.email} 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">First Name</label>
                      <Input 
                        placeholder="Enter your first name" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Last Name</label>
                      <Input 
                        placeholder="Enter your last name" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Phone Number</label>
                      <Input 
                        placeholder="Enter your phone number" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Date of Birth</label>
                      <Input 
                        type="date"
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Address</label>
                    <Input 
                      placeholder="Enter your address" 
                      className="bg-white/5 border-white/10 text-white/90 mb-3" 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input 
                        placeholder="City" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                      <Input 
                        placeholder="State/Province" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                      <Input 
                        placeholder="Postal Code" 
                        className="bg-white/5 border-white/10 text-white/90" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="thunder-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Lock className="mr-2 text-casino-thunder-green" />
                  Security Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white/90 font-medium mb-4">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Current Password</label>
                        <Input 
                          type="password"
                          placeholder="Enter your current password" 
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">New Password</label>
                        <Input 
                          type="password"
                          placeholder="Enter your new password" 
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                        <p className="text-white/50 text-xs mt-1">Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number</p>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Confirm New Password</label>
                        <Input 
                          type="password"
                          placeholder="Confirm your new password" 
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                      </div>
                      <div className="pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Password Updated",
                              description: "Your password has been changed successfully.",
                            });
                          }}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5">
                        <Checkbox id="enable-2fa" />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="enable-2fa" className="text-white/90 font-medium cursor-pointer">Enable Two-Factor Authentication</label>
                        <p className="text-white/70">Add an extra layer of security to your account. We'll ask for a verification code when you sign in on new devices.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Two-factor authentication will be available soon!",
                        });
                      }}
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Set Up Two-Factor
                    </Button>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Login Sessions</h3>
                    <p className="text-white/70 mb-4">These are the devices that have logged into your account. Revoke any sessions that you do not recognize.</p>
                    
                    <div className="bg-white/5 rounded-md p-4 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white/90 font-medium">Current Session - Chrome on Windows</p>
                          <p className="text-white/70 text-sm">IP: 192.168.1.1 - Last accessed: Just now</p>
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white/90 font-medium">Safari on iPhone</p>
                          <p className="text-white/70 text-sm">IP: 192.168.1.2 - Last accessed: 2 days ago</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="thunder-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Bell className="mr-2 text-casino-thunder-green" />
                  Notification Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white/90 font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="email-promotions" defaultChecked />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-promotions" className="text-white/90 font-medium cursor-pointer">Promotions and Bonuses</label>
                          <p className="text-white/70">Receive emails about special offers, bonuses, and promotions.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="email-account" defaultChecked />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-account" className="text-white/90 font-medium cursor-pointer">Account Updates</label>
                          <p className="text-white/70">Receive emails about your account activity, deposits, and withdrawals.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="email-news" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="email-news" className="text-white/90 font-medium cursor-pointer">News and Updates</label>
                          <p className="text-white/70">Receive emails about new games, features, and platform updates.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Push Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="push-bonuses" defaultChecked />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="push-bonuses" className="text-white/90 font-medium cursor-pointer">Bonus Credits</label>
                          <p className="text-white/70">Get notified when bonuses are credited to your account.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="push-deposits" defaultChecked />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="push-deposits" className="text-white/90 font-medium cursor-pointer">Deposits and Withdrawals</label>
                          <p className="text-white/70">Get notified about deposit and withdrawal status updates.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5 pt-1">
                          <Checkbox id="push-promotions" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="push-promotions" className="text-white/90 font-medium cursor-pointer">Promotions and Special Events</label>
                          <p className="text-white/70">Get notified about special promotions and events.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preferences Settings */}
            {activeTab === "preferences" && (
              <div className="thunder-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Globe className="mr-2 text-casino-thunder-green" />
                  Preferences
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white/90 font-medium mb-4">Language and Currency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Language</label>
                        <select className="thunder-input bg-white/5 border-white/10 text-white/90 w-full">
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Currency</label>
                        <select className="thunder-input bg-white/5 border-white/10 text-white/90 w-full">
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="btc">Bitcoin (₿)</option>
                          <option value="eth">Ethereum (Ξ)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Display Settings</h3>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5 pt-1">
                        <Checkbox id="dark-mode" defaultChecked />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="dark-mode" className="text-white/90 font-medium cursor-pointer">Dark Mode</label>
                        <p className="text-white/70">Use dark mode theme for the casino interface.</p>
                      </div>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5 pt-1">
                        <Checkbox id="animations" defaultChecked />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="animations" className="text-white/90 font-medium cursor-pointer">Enable Animations</label>
                        <p className="text-white/70">Show animations during gameplay and throughout the site.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5 pt-1">
                        <Checkbox id="sound-effects" defaultChecked />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="sound-effects" className="text-white/90 font-medium cursor-pointer">Sound Effects</label>
                        <p className="text-white/70">Enable sound effects during gameplay.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Responsible Gaming Settings */}
            {activeTab === "responsible-gaming" && (
              <div className="thunder-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Shield className="mr-2 text-casino-thunder-green" />
                  Responsible Gaming
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-white/80 mb-4">
                      At ThunderWin, we're committed to promoting responsible gaming. Use these tools to help keep your gaming experience enjoyable and under control.
                    </p>
                    
                    <h3 className="text-white/90 font-medium mb-4">Deposit Limits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Daily Limit ($)</label>
                        <Input 
                          type="number"
                          defaultValue="100"
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Weekly Limit ($)</label>
                        <Input 
                          type="number"
                          defaultValue="500"
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Monthly Limit ($)</label>
                        <Input 
                          type="number"
                          defaultValue="1000"
                          className="bg-white/5 border-white/10 text-white/90" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Self-Exclusion Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Take a Break</label>
                        <select className="thunder-input bg-white/5 border-white/10 text-white/90 w-full">
                          <option value="">Select a time period</option>
                          <option value="24h">24 Hours</option>
                          <option value="7d">7 Days</option>
                          <option value="30d">30 Days</option>
                          <option value="90d">90 Days</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          className="mb-0.5 h-10"
                          onClick={() => {
                            toast({
                              title: "Break Period Set",
                              description: "Your break period has been activated. You'll be automatically logged out.",
                            });
                          }}
                        >
                          Apply Break
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-red-900/20 border border-red-500/20 rounded-md p-4 mb-6">
                      <h4 className="text-white/90 font-medium mb-2">Self-Exclude from ThunderWin</h4>
                      <p className="text-white/70 text-sm mb-4">
                        Self-exclusion will prevent you from accessing your account for the selected period. This action cannot be undone until the exclusion period ends.
                      </p>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          toast({
                            title: "Self-Exclusion",
                            description: "Please contact support to set up self-exclusion.",
                            variant: "destructive",
                          });
                        }}
                      >
                        Self-Exclude
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-white/90 font-medium mb-4">Reality Check</h3>
                    <p className="text-white/70 mb-4">
                      Set reminders to alert you when you've been playing for a specified period of time.
                    </p>
                    <div className="flex items-start mb-4">
                      <div className="flex items-center h-5 pt-1">
                        <Checkbox id="reality-check" defaultChecked />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="reality-check" className="text-white/90 font-medium cursor-pointer">Enable Reality Check</label>
                        <p className="text-white/70">Show a reminder after the specified interval.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Reminder Interval</label>
                      <select className="thunder-input bg-white/5 border-white/10 text-white/90 w-full max-w-xs">
                        <option value="30m">Every 30 Minutes</option>
                        <option value="1h">Every 1 Hour</option>
                        <option value="2h">Every 2 Hours</option>
                        <option value="3h">Every 3 Hours</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Limits
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? "bg-casino-thunder-green text-black" 
        : "text-white/80 hover:bg-white/5 hover:text-white"
    }`}
    onClick={onClick}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

export default Settings;
