import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, User, Bell, UserCircle } from "lucide-react";
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

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState("casino");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  return (
    <header className="bg-casino-thunder-dark border-b border-white/5">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
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
          <img src="/file.svg" alt="ThunderWin" className="h-8 thunder-glow" />
        </Link>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="fixed top-0 left-0 w-full h-screen bg-casino-thunder-darker z-50 p-4">
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
              <TabsList className="justify-center mb-4">
                <TabsTrigger value="casino" onClick={() => setMobileTab("casino")}>
                  Casino
                </TabsTrigger>
                <TabsTrigger value="sports" onClick={() => setMobileTab("sports")}>
                  Sports
                </TabsTrigger>
                <TabsTrigger value="promotions" onClick={() => setMobileTab("promotions")}>
                  Promotions
                </TabsTrigger>
              </TabsList>

              {mobileTab === "casino" && (
                <div className="flex flex-col space-y-3">
                  <Link to="/casino" className="block py-2 text-white hover:text-casino-thunder-green">
                    All Games
                  </Link>
                  <Link to="/casino/slots" className="block py-2 text-white hover:text-casino-thunder-green">
                    Slots
                  </Link>
                  <Link to="/casino/table-games" className="block py-2 text-white hover:text-casino-thunder-green">
                    Table Games
                  </Link>
                  <Link to="/casino/live-casino" className="block py-2 text-white hover:text-casino-thunder-green">
                    Live Casino
                  </Link>
                  <Link to="/casino/jackpots" className="block py-2 text-white hover:text-casino-thunder-green">
                    Jackpots
                  </Link>
                  <Link to="/casino/providers" className="block py-2 text-white hover:text-casino-thunder-green">
                    Providers
                  </Link>
                </div>
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
          <div className="flex items-center space-x-6">
            <Link to="/casino" className="text-white hover:text-casino-thunder-green">
              Casino
            </Link>
            <Link to="/sports" className="text-white hover:text-casino-thunder-green">
              Sports
            </Link>
            <Link to="/promotions" className="text-white hover:text-casino-thunder-green">
              Promotions
            </Link>
            <Link to="/vip" className="text-white hover:text-casino-thunder-green">
              VIP
            </Link>
            <Link to="/bonuses" className="text-white hover:text-casino-thunder-green">
              Bonuses
            </Link>
          </div>
        )}

        {/* Auth Buttons */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={user?.name || user?.username} />
                      <AvatarFallback>{user?.name?.slice(0, 1) || user?.username?.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="absolute right-1 bottom-1 h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuLabel>{user?.name || user?.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/transactions")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/5">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
