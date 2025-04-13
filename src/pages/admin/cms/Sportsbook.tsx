
import React from 'react';
import { Edit, ImageIcon, Plus, Save, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const CMSSportsbook = () => {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your sportsbook content has been updated."
    });
  };

  return (
    <div>
      <CMSPageHeader 
        title="Sportsbook Content" 
        description="Manage banners, featured competitions, and other content for the sportsbook section."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CMSCard title="Hero Banner">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Main Heading</label>
                <Input 
                  defaultValue="Bet on Your Favorite Sports" 
                  className="bg-slate-900 border-slate-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subheading</label>
                <Textarea 
                  defaultValue="Experience the thrill of sports betting with competitive odds and live-in-play action" 
                  className="bg-slate-900 border-slate-700" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Primary CTA Text</label>
                  <Input 
                    defaultValue="Place a Bet" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Primary CTA Link</label>
                  <Input 
                    defaultValue="/sports/football" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Background Image</label>
                <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
                    <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                      Upload Image
                    </Button>
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-400">Recommended: 1920×600px</p>
              </div>
            </div>
          </CMSCard>
        </div>
        
        <div>
          <CMSCard title="Page Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Live Betting</h3>
                  <p className="text-xs text-gray-400">Show live betting section</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Odds Boosters</h3>
                  <p className="text-xs text-gray-400">Display special boosted odds</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Bet Builder</h3>
                  <p className="text-xs text-gray-400">Enable custom bet building</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Cashout Feature</h3>
                  <p className="text-xs text-gray-400">Allow early cashout on bets</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Sports Promotions</h3>
                  <p className="text-xs text-gray-400">Show sports-specific offers</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CMSCard>
        </div>
      </div>
      
      <CMSCard title="Featured Competitions">
        <div className="mb-4 flex justify-end">
          <Button size="sm" className="text-white bg-slate-700 hover:bg-slate-600">
            <Plus size={16} className="mr-2" /> Add Competition
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Highlight</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  Champions League
                </div>
              </TableCell>
              <TableCell>Football</TableCell>
              <TableCell><Switch defaultChecked /></TableCell>
              <TableCell>1</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  NBA
                </div>
              </TableCell>
              <TableCell>Basketball</TableCell>
              <TableCell><Switch defaultChecked /></TableCell>
              <TableCell>2</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  Premier League
                </div>
              </TableCell>
              <TableCell>Football</TableCell>
              <TableCell><Switch defaultChecked /></TableCell>
              <TableCell>3</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  Wimbledon
                </div>
              </TableCell>
              <TableCell>Tennis</TableCell>
              <TableCell><Switch defaultChecked /></TableCell>
              <TableCell>4</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CMSCard>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="bg-casino-thunder-green hover:bg-green-600 text-white">
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CMSSportsbook;
