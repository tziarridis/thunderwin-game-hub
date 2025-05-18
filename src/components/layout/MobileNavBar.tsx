import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Home, User, Settings, LogOut, PlusCircle, ListChecks, ShieldCheck } from 'lucide-react';
import WalletBalance from '@/components/user/WalletBalance';

const MobileNavBar = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-64">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Explore your account and settings.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{user.username}</h4>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          )}
        </div>
        <Separator />
        <div className="py-4">
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/casino">
                  <Home className="mr-2 h-4 w-4" />
                  Casino
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
            </li>
             <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/payment/deposit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Deposit
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/kyc">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  KYC Verification
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/transactions">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Transactions
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="justify-start w-full" asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </li>
          </ul>
        </div>
        <Separator />
        <div className="py-4">
          <Button variant="ghost" className="justify-start w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
         <Separator />
         <div className="py-4">
          <div className="hidden md:block">
            {isAuthenticated && user ? (
                <WalletBalance user={user} />
            ) : (
                <Skeleton className="h-8 w-24" />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavBar;
