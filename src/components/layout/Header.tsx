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
  Activity
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
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/5"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.img 
              src="/file.svg" 
              alt="ThunderWin" 
              className="h-8 thunder-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Mobile Menu */}
          {isMobile && isMenuOpen && (
            <div className="fixed top-0 left-0 w-full h-screen bg-casino-thunder-darker/95 backdrop-blur-lg z-50 p-4">
              <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center">
                  <img src="/file.svg" alt="ThunderWin" className="h-8 thunder-glow" />
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
                      { icon: <Gamepad2 className="h-5 w-5 mr-3" />, label: "All Games", path: "/casino" },
                      { icon: <Activity className="h-5 w-5 mr-3" />, label: "Slots", path: "/casino/slots" },
                      { icon: <Activity className="h-5 w-5 mr-3" />, label: "Table Games", path: "/casino/table-games" },
                      { icon: <Activity className="h-5 w-5 mr-3" />, label: "Live Casino", path: "/casino/live-casino" },
                      { icon: <Activity className="h-5 w-5 mr-3" />, label: "Jackpots", path: "/casino/jackpots" },
                      { icon: <Activity className="h-5 w-5 mr-3" />, label: "Providers", path: "/casino/providers" },
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
                    <Link to="/sports" className="block py-2 text-white hover:text-casino-thunder-green">
                      All Sports
                    </Link>
                    <Link to="/sports/football" className="block py-2 text-white hover:text-casino-thunder-green">
                      Football
                    </Link>
                    <Link to="/sports/basketball" className="block py-2 text-white hover:text-casino-thunder-green">
                      Basketball
                    </Link>
                    <Link to="/sports/tennis" className="block py-2 text-white hover:text-casino-thunder-green">
                      Tennis
                    </Link>
                    <Link to="/sports/hockey" className="block py-2 text-white hover:text-casino-thunder-green">
                      Hockey
                    </Link>
                    <Link to="/sports/esports" className="block py-2 text-white hover:text-casino-thunder-green">
                      Esports
                    </Link>
                  </div>
                )}

                {mobileTab === "promotions" && (
                  <div className="flex flex-col space-y-3">
                    <Link to="/promotions" className="block py-2 text-white hover:text-casino-thunder-green">
                      All Promotions
                    </Link>
                  </div>
                )}

                <div className="border-t border-white/10 mt-6 pt-6">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3">
                      <Link to="/profile" className="block py-2 text-white hover:text-casino-thunder-green">
                        My Profile
                      </Link>
                      <Link to="/transactions" className="block py-2 text-white hover:text-casino-thunder-green">
                        Transactions
                      </Link>
                      <Link to="/settings" className="block py-2 text-white hover:text-casino-thunder-green">
                        Settings
                      </Link>
                      <Link to="/support/help" className="block py-2 text-white hover:text-casino-thunder-green">
                        Support
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block py-2 text-white hover:text-casino-thunder-green text-left"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Link to="/login" className="block py-2 text-white hover:text-casino-thunder-green">
                        Login
                      </Link>
                      <Link to="/register" className="block py-2 text-white hover:text-casino-thunder-green">
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
                          {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                              {unreadNotificationsCount}
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
                  
                  {/* User Menu - Fix user button issue */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-none outline-none flex items-center justify-center"
                      >
                        <Avatar className="h-9 w-9 border-2 border-casino-thunder-green/50">
                          <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name || user?.username} />
                          <AvatarFallback className="bg-casino-thunder-green/20 text-white">
                            {user?.name?.slice(0, 1) || user?.username?.slice(0, 1) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mr-2 glass-popup">
                      <DropdownMenuLabel>{user?.name || user?.username}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      
                      {user?.balance !== undefined && (
                        <div className="px-2 py-1.5 mb-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Balance:</span>
                            <span className="font-medium text-casino-thunder-green">
                              ${user.balance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <DropdownMenuItem onClick={() => navigate("/profile")} className="hover:bg-white/5 hover:text-casino-thunder-green cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/transactions")} className="hover:bg-white/5 hover:text-casino-thunder-green cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Transactions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")} className="hover:bg-white/5 hover:text-casino-thunder-green cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 hover:text-casino-thunder-green cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
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
