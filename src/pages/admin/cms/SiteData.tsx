
import React, { useState } from 'react';
import { Eye, FileText, Globe, ImageIcon, Link2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CMSSiteData = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [previewContent, setPreviewContent] = useState<{ title: string, content: string } | null>(null);
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Changes saved",
      description: "Your site data has been updated successfully."
    });
  };

  const handlePreview = (title: string, content: string) => {
    setPreviewContent({ title, content });
  };

  return (
    <div>
      <CMSPageHeader 
        title="Site Data" 
        description="Manage global site elements like logos, legal content, and contact information."
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-700">
          <TabsTrigger value="branding" className="data-[state=active]:bg-slate-800">
            <ImageIcon size={16} className="mr-2" /> Branding
          </TabsTrigger>
          <TabsTrigger value="legal" className="data-[state=active]:bg-slate-800">
            <FileText size={16} className="mr-2" /> Legal Content
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-slate-800">
            <Link2 size={16} className="mr-2" /> Footer Links
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-slate-800">
            <Globe size={16} className="mr-2" /> Support & SEO
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CMSCard title="Logo (Light Mode)">
              <div className="space-y-4">
                <div className="h-32 bg-white border border-dashed border-slate-700 rounded-md flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex items-center justify-center">
                      <img src="/file.svg" alt="Logo preview" className="h-12" />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="bg-slate-100 text-slate-800">
                      Upload Logo
                    </Button>
                    <p className="text-xs mt-2 text-gray-400">Recommended: PNG with transparent background</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Alt Text</label>
                  <Input 
                    defaultValue="ThunderWin Casino" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="Logo (Dark Mode)">
              <div className="space-y-4">
                <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex items-center justify-center">
                      <img src="/file.svg" alt="Logo preview" className="h-12 filter invert" />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                      Upload Logo
                    </Button>
                    <p className="text-xs mt-2 text-gray-400">Recommended: PNG with transparent background</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Alt Text</label>
                  <Input 
                    defaultValue="ThunderWin Casino" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="Favicon">
              <div className="space-y-4">
                <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-slate-800 rounded-md flex items-center justify-center">
                      <img src="/file.svg" alt="Favicon preview" className="h-8" />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                      Upload Favicon
                    </Button>
                    <p className="text-xs mt-2 text-gray-400">Recommended: 32×32px PNG</p>
                  </div>
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="Mobile App Icon">
              <div className="space-y-4">
                <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-slate-800 rounded-md flex items-center justify-center">
                      <img src="/file.svg" alt="App icon preview" className="h-8" />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                      Upload App Icon
                    </Button>
                    <p className="text-xs mt-2 text-gray-400">Recommended: 192×192px PNG</p>
                  </div>
                </div>
              </div>
            </CMSCard>
          </div>
        </TabsContent>
        
        <TabsContent value="legal" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <CMSCard title="Terms and Conditions">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Content</label>
                    <p className="text-xs text-gray-400">Use the editor below to update Terms of Use</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview("Terms and Conditions", "These are the terms and conditions for using our platform...")}
                  >
                    <Eye size={16} className="mr-2" /> Preview
                  </Button>
                </div>
                <div className="min-h-48 p-4 bg-slate-900 border border-slate-700 rounded-md">
                  <div className="bg-slate-800 p-2 mb-2 rounded-md flex items-center gap-2 border-b border-slate-700">
                    <Button variant="ghost" size="sm">B</Button>
                    <Button variant="ghost" size="sm">I</Button>
                    <Button variant="ghost" size="sm">U</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">H1</Button>
                    <Button variant="ghost" size="sm">H2</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">Link</Button>
                    <Button variant="ghost" size="sm">List</Button>
                  </div>
                  <Textarea 
                    className="min-h-32 bg-slate-900 border-none resize-none focus-visible:ring-0" 
                    placeholder="Enter your terms and conditions here..."
                    defaultValue="These are the terms and conditions for using our platform..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="terms-multilanguage" />
                  <label htmlFor="terms-multilanguage" className="text-sm">Enable multi-language support</label>
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="Privacy Policy">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Content</label>
                    <p className="text-xs text-gray-400">Use the editor below to update Privacy Policy</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview("Privacy Policy", "This privacy policy explains how we collect and process your personal data...")}
                  >
                    <Eye size={16} className="mr-2" /> Preview
                  </Button>
                </div>
                <div className="min-h-48 p-4 bg-slate-900 border border-slate-700 rounded-md">
                  <div className="bg-slate-800 p-2 mb-2 rounded-md flex items-center gap-2 border-b border-slate-700">
                    <Button variant="ghost" size="sm">B</Button>
                    <Button variant="ghost" size="sm">I</Button>
                    <Button variant="ghost" size="sm">U</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">H1</Button>
                    <Button variant="ghost" size="sm">H2</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">Link</Button>
                    <Button variant="ghost" size="sm">List</Button>
                  </div>
                  <Textarea 
                    className="min-h-32 bg-slate-900 border-none resize-none focus-visible:ring-0" 
                    placeholder="Enter your privacy policy here..."
                    defaultValue="This privacy policy explains how we collect and process your personal data..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="privacy-multilanguage" />
                  <label htmlFor="privacy-multilanguage" className="text-sm">Enable multi-language support</label>
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="Responsible Gaming">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Content</label>
                    <p className="text-xs text-gray-400">Use the editor below to update Responsible Gaming policy</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview("Responsible Gaming", "We are committed to promoting responsible gaming...")}
                  >
                    <Eye size={16} className="mr-2" /> Preview
                  </Button>
                </div>
                <div className="min-h-48 p-4 bg-slate-900 border border-slate-700 rounded-md">
                  <div className="bg-slate-800 p-2 mb-2 rounded-md flex items-center gap-2 border-b border-slate-700">
                    <Button variant="ghost" size="sm">B</Button>
                    <Button variant="ghost" size="sm">I</Button>
                    <Button variant="ghost" size="sm">U</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">H1</Button>
                    <Button variant="ghost" size="sm">H2</Button>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <Button variant="ghost" size="sm">Link</Button>
                    <Button variant="ghost" size="sm">List</Button>
                  </div>
                  <Textarea 
                    className="min-h-32 bg-slate-900 border-none resize-none focus-visible:ring-0" 
                    placeholder="Enter your responsible gaming policy here..."
                    defaultValue="We are committed to promoting responsible gaming..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="responsible-multilanguage" />
                  <label htmlFor="responsible-multilanguage" className="text-sm">Enable multi-language support</label>
                </div>
              </div>
            </CMSCard>
          </div>
        </TabsContent>
        
        <TabsContent value="footer" className="mt-6">
          <CMSCard title="Footer Links">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link Text</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>About Us</TableCell>
                  <TableCell>/about</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Terms of Use</TableCell>
                  <TableCell>/legal/terms</TableCell>
                  <TableCell>Legal</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Privacy Policy</TableCell>
                  <TableCell>/legal/privacy</TableCell>
                  <TableCell>Legal</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Responsible Gaming</TableCell>
                  <TableCell>/support/responsible-gaming</TableCell>
                  <TableCell>Support</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>FAQ</TableCell>
                  <TableCell>/support/faq</TableCell>
                  <TableCell>Support</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Contact Us</TableCell>
                  <TableCell>/support/contact</TableCell>
                  <TableCell>Support</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Affiliates</TableCell>
                  <TableCell>/affiliates</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell><Switch defaultChecked /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button size="sm" className="bg-slate-700 hover:bg-slate-600">
                <Plus size={16} className="mr-2" /> Add Link
              </Button>
            </div>
          </CMSCard>
        </TabsContent>
        
        <TabsContent value="support" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CMSCard title="Support Contact Details">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Support Email</label>
                  <Input 
                    defaultValue="support@thunderwin.com" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telegram Username</label>
                  <Input 
                    defaultValue="@ThunderWinSupport" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Live Chat URL</label>
                  <Input 
                    defaultValue="https://support.thunderwin.com/chat" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Support Hours</label>
                  <Input 
                    defaultValue="24/7" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
              </div>
            </CMSCard>
            
            <CMSCard title="SEO Metadata">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Default Page Title</label>
                  <Input 
                    defaultValue="ThunderWin Casino | Play Slots, Live Games & Sports Betting" 
                    className="bg-slate-900 border-slate-700" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Used when no page-specific title is set</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Default Meta Description</label>
                  <Textarea 
                    defaultValue="ThunderWin offers the best online casino games, live dealer tables, and sports betting with generous bonuses and 24/7 support." 
                    className="bg-slate-900 border-slate-700" 
                  />
                  <p className="text-xs text-gray-400 mt-1">Used when no page-specific description is set</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Default Keywords</label>
                  <Input 
                    defaultValue="online casino, slots, live casino, betting, sportsbook" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="advanced-seo" />
                  <label htmlFor="advanced-seo" className="text-sm">Enable advanced SEO settings per page</label>
                </div>
              </div>
            </CMSCard>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="bg-casino-thunder-green hover:bg-green-600 text-white">
          <Save size={16} className="mr-2" /> Save Changes
        </Button>
      </div>
      
      {/* Content Preview Dialog */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewContent?.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              This is how the content will appear on the frontend
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-white text-slate-900 p-6 rounded-md">
            {previewContent?.content}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setPreviewContent(null)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMSSiteData;
