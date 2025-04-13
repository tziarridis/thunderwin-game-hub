
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NavigationMenu from "./NavigationMenu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, LogIn, Menu, X, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { scrollToTop } from "@/utils/scrollUtils";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogin = () => {
    navigate("/login");
    scrollToTop();
  };

  const handleRegister = () => {
    navigate("/register");
    scrollToTop();
  };

  const handleProfile = () => {
    navigate("/profile");
    scrollToTop();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    scrollToTop();
  };
  
  const handleHelpCenter = () => {
    navigate("/support/help");
    scrollToTop();
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    scrollToTop();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed w-full z-50 bg-casino-thunder-darker/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="cursor-pointer mr-4" 
            onClick={() => {
              navigate("/");
              scrollToTop();
            }}
          >
            <img 
              src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
              alt="ThunderWin Casino" 
              className="h-14 md:h-16"
            />
          </div>
          
          {!isMobile && <NavigationMenu />}
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-casino-thunder-green">
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.username} />
                      <AvatarFallback className="bg-casino-thunder-green text-black">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleHelpCenter}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help Center</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="hidden sm:flex border-casino-thunder-green hover:border-casino-thunder-green/80 hover:bg-casino-thunder-green/10"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              
              <Button 
                className="hidden sm:flex bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
                onClick={handleRegister}
              >
                Register
              </Button>
            </>
          )}
          
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 bg-casino-thunder-darker border-l border-white/10">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-white/10">
                    <img 
                      src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
                      alt="ThunderWin Casino" 
                      className="h-12" 
                    />
                  </div>
                  
                  <div className="py-4 px-2 flex-1 overflow-auto">
                    <MobileNavLink 
                      title="Casino" 
                      icon={<span className="text-casino-thunder-green">♠️</span>}
                      onClick={() => handleNavigate("/casino")}
                    />
                    <MobileNavLink 
                      title="Slots" 
                      icon={<span className="text-casino-thunder-green">🎰</span>}
                      onClick={() => handleNavigate("/casino/slots")}
                    />
                    <MobileNavLink 
                      title="Table Games" 
                      icon={<span className="text-casino-thunder-green">♣️</span>}
                      onClick={() => handleNavigate("/casino/table-games")}
                    />
                    <MobileNavLink 
                      title="Live Casino" 
                      icon={<span className="text-casino-thunder-green">🎮</span>}
                      onClick={() => handleNavigate("/casino/live-casino")}
                    />
                    <MobileNavLink 
                      title="Jackpots" 
                      icon={<span className="text-casino-thunder-green">💰</span>}
                      onClick={() => handleNavigate("/casino/jackpots")}
                    />
                    <MobileNavLink 
                      title="Promotions" 
                      icon={<span className="text-casino-thunder-green">🎁</span>}
                      onClick={() => handleNavigate("/promotions")}
                    />
                    <MobileNavLink 
                      title="Help Center" 
                      icon={<span className="text-casino-thunder-green">❓</span>}
                      onClick={() => handleNavigate("/support/help")}
                    />
                    
                    {isAuthenticated && (
                      <>
                        <div className="h-px bg-white/10 my-4"></div>
                        <MobileNavLink 
                          title="Profile" 
                          icon={<span className="text-casino-thunder-green">👤</span>}
                          onClick={() => handleNavigate("/profile")}
                        />
                        {user?.isAdmin && (
                          <MobileNavLink 
                            title="Admin Dashboard" 
                            icon={<span className="text-casino-thunder-green">⚙️</span>}
                            onClick={() => handleNavigate("/admin")}
                          />
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="mt-auto p-4 border-t border-white/10">
                    {isAuthenticated ? (
                      <Button 
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-white"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="w-full bg-casino-thunder-green hover:bg-casino-thunder-green/80 text-black"
                          onClick={() => {
                            handleRegister();
                            setIsMenuOpen(false);
                          }}
                        >
                          Register
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green/10"
                          onClick={() => {
                            handleLogin();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

type MobileNavLinkProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  highlight?: boolean;
};

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ title, icon, onClick, highlight }) => {
  return (
    <button 
      className={`flex items-center w-full px-4 py-3 rounded-lg text-left ${
        highlight 
          ? "bg-gradient-to-r from-casino-thunder-green/20 to-transparent text-white" 
          : "text-white/80 hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      <div className="w-8 h-8 flex items-center justify-center mr-3">
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </button>
  );
};

export default AppHeader;
