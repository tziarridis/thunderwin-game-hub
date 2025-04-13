
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Bell, 
  UserCircle, 
  CreditCard, 
  Settings, 
  LogOut,
  HelpCircle,
  MessageSquare,
  Wallet,
  Gamepad2,
  Trophy,
  Gift,
  Crown,
  Zap,
  Activity,
  Sparkles,
  Table2,
  Users,
  DollarSign,
  Star,
  Heart
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DepositButton from "@/components/user/DepositButton";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { User as UserType } from "@/types";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("casino");
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New bonus available!", isRead: false },
    { id: 2, message: "Deposit successful", isRead: true },
    { id: 3, message: "Your VIP level has increased!", isRead: false },
  ]);
  
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating or window resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { icon: <Gamepad2 className="h-5 w-5" />, label: "Casino", path: "/casino" },
    { icon: <Trophy className="h-5 w-5" />, label: "Sports", path: "/sports" },
    { icon: <Gift className="h-5 w-5" />, label: "Promotions", path: "/promotions" },
    { icon: <Crown className="h-5 w-5" />, label: "VIP", path: "/vip" },
    { icon: <Zap className="h-5 w-5" />, label: "Bonuses", path: "/bonuses" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-lg shadow-md' : 'bg-casino-thunder-dark border-b border-white/5'}`}>
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Updated with 3-line icon */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/5 flex flex-col justify-center items-center gap-1"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <>
                  <div className="w-5 h-0.5 bg-white rounded-full" />
                  <div className="w-5 h-0.5 bg-white rounded-full" />
                  <div className="w-5 h-0.5 bg-white rounded-full" />
                </>
              )}
            </Button>
          )}

          {/* Logo - Increased size for both mobile and desktop */}
          <Link to="/" className="flex items-center">
            <motion.img 
              src="/file.svg" 
              alt="ThunderWin" 
              className={`thunder-glow ${isMobile ? 'h-10' : 'h-12'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Mobile Menu - Updated with unique icons */}
          {isMobile && isMenuOpen && (
            <div className="fixed top-0 left-0 w-full h-screen bg-casino-thunder-darker/95 backdrop-blur-lg z-50 p-4">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center">
                  <img src="/file.svg" alt="ThunderWin" className="h-10 thunder-glow" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white hover:bg-white/5"
                >
                  <X size={24} />
                </Button>
              </div>

              <Tabs defaultValue="casino" className="w-full">
                <TabsList className="justify-center mb-4 bg-white/10 backdrop-blur-md">
                  <TabsTrigger value="casino" onClick={() => setMobileTab("casino")}>
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Casino
                  </TabsTrigger>
                  <TabsTrigger value="sports" onClick={() => setMobileTab("sports")}>
                    <Trophy className="mr-2 h-4 w-4" />
                    Sports
                  </TabsTrigger>
                  <TabsTrigger value="promotions" onClick={() => setMobileTab("promotions")}>
                    <Gift className="mr-2 h-4 w-4" />
                    Promotions
                  </TabsTrigger>
                </TabsList>

                {mobileTab === "casino" && (
                  <motion.div 
                    className="flex flex-col space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {[
                      { icon: <Gamepad2 className="h-5 w-5 mr-3 text-casino-thunder-green" />, label: "All Games", path: "/casino" },
                      { icon: <Activity className="h-5 w-5 mr-3 text-pink-400" />, label: "Slots", path: "/casino/slots" },
                      { icon: <Table2 className="h-5 w-5 mr-3 text-blue-400" />, label: "Table Games", path: "/casino/table-games" },
                      { icon: <Users className="h-5 w-5 mr-3 text-purple-400" />, label: "Live Casino", path: "/casino/live-casino" },
                      { icon: <Sparkles className="h-5 w-5 mr-3 text-yellow-400" />, label: "Jackpots", path: "/casino/jackpots" },
                      { icon: <Star className="h-5 w-5 mr-3 text-orange-400" />, label: "Providers", path: "/casino/providers" },
                    ].map((item, index) => (
                      <motion.div 
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link 
                          to={item.path} 
                          className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {mobileTab === "sports" && (
                  <div className="flex flex-col space-y-3">
                    <Link to="/sports" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Trophy className="h-5 w-5 mr-3 text-casino-thunder-green" />
                      All Sports
                    </Link>
                    <Link to="/sports/football" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Activity className="h-5 w-5 mr-3 text-green-400" />
                      Football
                    </Link>
                    <Link to="/sports/basketball" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Activity className="h-5 w-5 mr-3 text-orange-400" />
                      Basketball
                    </Link>
                    <Link to="/sports/tennis" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Activity className="h-5 w-5 mr-3 text-yellow-300" />
                      Tennis
                    </Link>
                    <Link to="/sports/hockey" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Activity className="h-5 w-5 mr-3 text-blue-300" />
                      Hockey
                    </Link>
                    <Link to="/sports/esports" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Gamepad2 className="h-5 w-5 mr-3 text-purple-400" />
                      Esports
                    </Link>
                  </div>
                )}

                {mobileTab === "promotions" && (
                  <div className="flex flex-col space-y-3">
                    <Link to="/promotions" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Gift className="h-5 w-5 mr-3 text-red-400" />
                      All Promotions
                    </Link>
                    <Link to="/bonuses" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Zap className="h-5 w-5 mr-3 text-yellow-400" />
                      Bonuses
                    </Link>
                    <Link to="/vip" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <Crown className="h-5 w-5 mr-3 text-purple-400" />
                      VIP Program
                    </Link>
                  </div>
                )}

                <div className="border-t border-white/10 mt-6 pt-6">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3">
                      <Link to="/profile" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <User className="h-5 w-5 mr-3 text-blue-400" />
                        My Profile
                      </Link>
                      <Link to="/transactions" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <CreditCard className="h-5 w-5 mr-3 text-green-400" />
                        Transactions
                      </Link>
                      <Link to="/settings" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <Settings className="h-5 w-5 mr-3 text-gray-400" />
                        Settings
                      </Link>
                      <Link to="/support/help" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <HelpCircle className="h-5 w-5 mr-3 text-purple-400" />
                        Support
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all text-left"
                      >
                        <LogOut className="h-5 w-5 mr-3 text-red-400" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link to="/login" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <User className="h-5 w-5 mr-3 text-blue-400" />
                        Login
                      </Link>
                      <Link to="/register" className="flex items-center py-3 px-4 text-white hover:text-casino-thunder-green bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <UserCircle className="h-5 w-5 mr-3 text-green-400" />
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </Tabs>
            </div>
          )}

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="flex items-center">
              <motion.nav 
                className="flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: index * 0.1 }
                    }}
                  >
                    <Link 
                      to={item.path} 
                      className="relative group flex items-center py-2 px-4 text-white hover:text-casino-thunder-green transition-colors rounded-md"
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </span>
                      
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-casino-thunder-green/70 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </div>
          )}

          {/* Auth Buttons */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Player Balance */}
                  {user?.balance !== undefined && (
                    <motion.div 
                      className="flex items-center bg-white/10 px-3 py-1.5 rounded-md border border-white/10 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Wallet className="h-4 w-4 text-casino-thunder-green mr-1.5" />
                      <span className="text-white font-medium">
                        ${user.balance.toFixed(2)}
                      </span>
                    </motion.div>
                  )}
                  
                  {/* Deposit Button */}
                  <DepositButton />
                  
                  {/* Support Button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-9 w-9 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                      onClick={() => navigate("/support/help")}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  
                  {/* Notifications */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="relative rounded-full h-9 w-9 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                        >
                          <Bell className="h-5 w-5" />
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {notifications.filter(n => !n.isRead).length}
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 glass-popup text-white">
                      <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="font-medium">Notifications</h3>
                        {unreadNotificationsCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={markAllNotificationsAsRead}
                            className="text-xs hover:text-casino-thunder-green"
                          >
                            Mark all as read
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-3 border-b border-white/5 hover:bg-white/5 ${!notification.isRead ? 'bg-white/10' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-casino-thunder-green' : 'bg-gray-500'}`} />
                                <div className="ml-2">
                                  <p className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-gray-300'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs hover:text-casino-thunder-green" 
                          onClick={() => navigate("/notifications")}
                        >
                          View all notifications
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* User Menu - Redesigned for better functionality */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative cursor-pointer">
                        <motion.div
                          className="h-9 w-9 rounded-full p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-casino-thunder-green/50 flex items-center justify-center overflow-hidden"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Avatar className="h-full w-full">
                            <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name || user?.username} />
                            <AvatarFallback className="bg-casino-thunder-green/20 text-white">
                              {user?.name?.slice(0, 1) || user?.username?.slice(0, 1) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-2 glass-popup text-white bg-black/90 backdrop-blur-lg border border-white/10 shadow-lg shadow-casino-thunder-green/20 animate-in fade-in-80 zoom-in-95 rounded-lg overflow-hidden">
                      <div className="p-2 border-b border-white/10">
                        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5">
                          <Avatar className="h-8 w-8 border border-casino-thunder-green/50">
                            <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name || user?.username} />
                            <AvatarFallback className="bg-casino-thunder-green/20 text-white">
                              {user?.name?.slice(0, 1) || user?.username?.slice(0, 1) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user?.name || user?.username}</span>
                            {user?.vipLevel && (
                              <span className="text-xs text-gray-400">VIP Level {user.vipLevel}</span>
                            )}
                          </div>
                        </DropdownMenuLabel>
                      </div>
                      
                      {user?.balance !== undefined && (
                        <div className="px-4 py-2 mb-1 bg-white/5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Balance:</span>
                            <span className="font-medium text-casino-thunder-green">
                              ${user.balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-1">
                        <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-white/10 hover:text-casino-thunder-green cursor-pointer rounded-md flex items-center gap-2 py-2">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/transactions")} className="hover:bg-white/10 hover:text-casino-thunder-green cursor-pointer rounded-md flex items-center gap-2 py-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Transactions</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/settings")} className="hover:bg-white/10 hover:text-casino-thunder-green cursor-pointer rounded-md flex items-center gap-2 py-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </div>
                      
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      <div className="p-1">
                        <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10 hover:text-casino-thunder-green cursor-pointer rounded-md flex items-center gap-2 py-2">
                          <LogOut className="h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm">
                        Login
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black neo-glow">
                        Register
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
