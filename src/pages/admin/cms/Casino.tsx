
import React from 'react';
import { Edit, ImageIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';
import { useToast } from '@/hooks/use-toast';

const CMSCasino = () => {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your casino page content has been updated."
    });
  };

  return (
    <div>
      <CMSPageHeader 
        title="Casino Page Content" 
        description="Update the content and visuals for the casino landing page."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CMSCard title="Hero Section">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Main Heading</label>
              <Input 
                defaultValue="Experience the Thrill of Online Casino" 
                className="bg-slate-900 border-slate-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subheading</label>
              <Input 
                defaultValue="Play the best slots and live casino games with amazing bonuses" 
                className="bg-slate-900 border-slate-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CTA Button Text</label>
              <Input 
                defaultValue="Play Now" 
                className="bg-slate-900 border-slate-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Background Image</label>
              <div className="h-24 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon size={24} className="mx-auto text-gray-500 mb-2" />
                  <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                    Upload Image
                  </Button>
                </div>
              </div>
              <p className="text-xs mt-1 text-gray-400">Recommended: 1920×1080px</p>
            </div>
          </div>
        </CMSCard>
        
        <CMSCard title="Features Section">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Section Title</label>
              <Input 
                defaultValue="Casino Features" 
                className="bg-slate-900 border-slate-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Feature 1</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  defaultValue="Fast Payouts" 
                  className="bg-slate-900 border-slate-700" 
                  placeholder="Title"
                />
                <Input 
                  defaultValue="lightning" 
                  className="bg-slate-900 border-slate-700" 
                  placeholder="Icon"
                />
              </div>
              <Textarea 
                defaultValue="Get your winnings quickly with our fast payout system" 
                className="bg-slate-900 border-slate-700 mt-2" 
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Feature 2</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  defaultValue="24/7 Support" 
                  className="bg-slate-900 border-slate-700" 
                  placeholder="Title"
                />
                <Input 
                  defaultValue="headphones" 
                  className="bg-slate-900 border-slate-700" 
                  placeholder="Icon"
                />
              </div>
              <Textarea 
                defaultValue="Our support team is available 24/7 to assist you" 
                className="bg-slate-900 border-slate-700 mt-2" 
                placeholder="Description"
              />
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-2" /> Add Feature
              </Button>
            </div>
          </div>
        </CMSCard>
      </div>
      
      <CMSCard title="Section Order">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 mb-3">Drag and drop to reorder sections on the casino page</p>
          
          <div className="bg-slate-700 p-3 rounded-md flex items-center justify-between">
            <span>1. Trending Games</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">⬆️</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">⬇️</Button>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3 rounded-md flex items-center justify-between">
            <span>2. Live Casino</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">⬆️</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">⬇️</Button>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3 rounded-md flex items-center justify-between">
            <span>3. Slots</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">⬆️</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">⬇️</Button>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3 rounded-md flex items-center justify-between">
            <span>4. Jackpot Games</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">⬆️</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">⬇️</Button>
            </div>
          </div>
          
          <div className="bg-slate-700 p-3 rounded-md flex items-center justify-between">
            <span>5. Table Games</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">⬆️</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">⬇️</Button>
            </div>
          </div>
        </div>
      </CMSCard>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="bg-casino-thunder-green hover:bg-green-600 text-white">
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CMSCasino;
