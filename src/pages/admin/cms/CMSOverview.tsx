
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ImageIcon, 
  Gamepad2,  
  Grid3x3, 
  Award as SportIcon,
  Globe,
  BarChart2 
} from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';

const CMSModule = ({ 
  title, 
  description, 
  icon, 
  path 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  path: string; 
}) => {
  return (
    <Link to={path} className="block">
      <div className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors h-full">
        <div className="flex items-center mb-3">
          <div className="p-2 bg-slate-800 rounded-md mr-3 text-casino-thunder-green">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </Link>
  );
};

const CMSOverview = () => {
  return (
    <div>
      <CMSPageHeader 
        title="Content Management System" 
        description="Manage and update your website content without touching the code."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CMSModule 
          title="Banners" 
          description="Manage promotional banners for web and mobile across the site." 
          icon={<ImageIcon size={24} />} 
          path="/admin/cms/banners" 
        />
        
        <CMSModule 
          title="Casino" 
          description="Update casino page content, texts and graphics." 
          icon={<Gamepad2 size={24} />} 
          path="/admin/cms/casino" 
        />
        
        <CMSModule 
          title="Dashboard Categories" 
          description="Manage game categories shown on the frontend dashboard." 
          icon={<Grid3x3 size={24} />} 
          path="/admin/cms/categories" 
        />
        
        <CMSModule 
          title="Sportsbook" 
          description="Configure sportsbook banners, features and promotions." 
          icon={<SportIcon size={24} />}
          path="/admin/cms/sportsbook" 
        />
        
        <CMSModule 
          title="Site Data" 
          description="Manage logos, SEO metadata, footer links and legal content." 
          icon={<Globe size={24} />} 
          path="/admin/cms/site-data" 
        />
        
        <CMSModule 
          title="Games Management" 
          description="Add, edit and manage casino games and their providers." 
          icon={<BarChart2 size={24} />} 
          path="/admin/cms/games" 
        />
      </div>
    </div>
  );
};

export default CMSOverview;
