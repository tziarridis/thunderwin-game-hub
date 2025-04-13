
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-casino-thunder-darker">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 mt-16 flex-grow">
        <aside className="w-full md:w-64 bg-slate-800 rounded-lg p-4 h-fit">
          <nav className="space-y-2">
            <h3 className="text-lg font-bold text-white mb-4">My Account</h3>
            <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-slate-700 text-white">
              Dashboard
            </Link>
            <Link to="/profile" className="block py-2 px-4 rounded hover:bg-slate-700 text-white">
              Profile
            </Link>
            <Link to="/transactions" className="block py-2 px-4 rounded hover:bg-slate-700 text-white">
              Transactions
            </Link>
            <Link to="/my-bonuses" className="block py-2 px-4 rounded hover:bg-slate-700 text-white">
              My Bonuses
            </Link>
            <Link to="/my-affiliate" className="block py-2 px-4 rounded hover:bg-slate-700 text-white">
              Affiliate Program
            </Link>
          </nav>
        </aside>
        <main className="flex-1 bg-slate-800 rounded-lg p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserLayout;
