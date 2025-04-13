import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';

const SiteData = () => {
  const [siteName, setSiteName] = useState('ThunderWin');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [seoTitle, setSeoTitle] = useState('ThunderWin - Online Casino');
  const [seoDescription, setSeoDescription] = useState('Play the best online casino games at ThunderWin.');
  const [footerText, setFooterText] = useState('© 2024 ThunderWin. All rights reserved.');
  const [legalContent, setLegalContent] = useState('Terms and conditions apply.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual submission logic
    alert('Site data updated!');
  };

  return (
    <div>
      <CMSPageHeader
        title="Site Data Management"
        description="Manage essential site-wide data such as logos, SEO metadata, and legal content."
      />

      <CMSCard title="General Settings">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-white">
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-white">
              Logo URL
            </label>
            <input
              type="text"
              id="logoUrl"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="seoTitle" className="block text-sm font-medium text-white">
              SEO Title
            </label>
            <input
              type="text"
              id="seoTitle"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="seoDescription" className="block text-sm font-medium text-white">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="footerText" className="block text-sm font-medium text-white">
              Footer Text
            </label>
            <input
              type="text"
              id="footerText"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="legalContent" className="block text-sm font-medium text-white">
              Legal Content
            </label>
            <textarea
              id="legalContent"
              className="mt-1 p-2 w-full rounded-md border-gray-600 bg-slate-800 text-white focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              value={legalContent}
              onChange={(e) => setLegalContent(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-casino-thunder-green hover:bg-casino-thunder-green-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Site Data
          </button>
        </form>
      </CMSCard>
    </div>
  );
};

export default SiteData;
