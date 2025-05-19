
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, children, className }: NavLinkProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "text-muted-foreground hover:text-white transition-colors", 
        className
      )}
    >
      {children}
    </Link>
  );
};

const NavLinks = () => {
  return (
    <div className="hidden md:flex items-center space-x-6">
      <NavLink to="/casino">Casino</NavLink>
      <NavLink to="/casino/slots">Slots</NavLink>
      <NavLink to="/casino/new-games">New Games</NavLink>
      <NavLink to="/casino/providers">Providers</NavLink>
      <NavLink to="/promotions">Promotions</NavLink>
    </div>
  );
};

export default NavLinks;
