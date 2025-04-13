
import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Edit, 
  Eye, 
  ImageIcon, 
  Plus, 
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import BannerForm from '@/components/admin/cms/BannerForm';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  location: string;
  backgroundColor: string;
  textColor: string;
  priority: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

// Mocked data for demonstration
const initialBanners: Banner[] = [
  {
    id: '1',
    title: 'Welcome Bonus',
    description: 'Get 100% up to $500 + 100 Free Spins on your first deposit!',
    imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
    ctaText: 'Claim Now',
    ctaUrl: '/promotions',
    location: 'home',
    backgroundColor: 'from-purple-900 to-blue-900',
    textColor: 'text-white',
    priority: 1,
    active: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  },
  {
    id: '2',
    title: 'Casino Tournament',
    description: 'Win big in our weekly casino tournament with $10,000 prize pool',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
    ctaText: 'Join Now',
    ctaUrl: '/tournaments',
    location: 'casino',
    backgroundColor: 'from-green-800 to-blue-900',
    textColor: 'text-white',
    priority: 1,
    active: true,
  },
  {
    id: '3',
    title: 'New Slots Released',
    description: 'Try our newest slot games with exciting bonus features',
    imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    ctaText: 'Play Now',
    ctaUrl: '/casino/new-games',
    location: 'slots',
    backgroundColor: 'from-amber-700 to-red-900',
    textColor: 'text-white',
    priority: 1,
    active: true,
  },
  {
    id: '4',
    title: 'VIP Program',
    description: 'Join our exclusive VIP program and get premium rewards',
    imageUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d',
    ctaText: 'Learn More',
    ctaUrl: '/vip',
    location: 'home',
    backgroundColor: 'from-casino-thunder-green to-blue-900',
    textColor: 'text-white',
    priority: 2,
    active: false,
  },
  {
    id: '5',
    title: 'Sports Betting Bonus',
    description: 'Get a free bet up to $50 on your first sports wager',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b',
    ctaText: 'Bet Now',
    ctaUrl: '/sports',
    location: 'sports',
    backgroundColor: 'from-blue-800 to-purple-900',
    textColor: 'text-white',
    priority: 1,
    active: true,
  }
];

const locationNames: Record<string, string> = {
  'home': 'Homepage',
  'casino': 'Casino Main',
  'slots': 'Casino Slots',
  'sports': 'Sports'
};

const CMSBanners = () => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  const form = useForm<Banner>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaUrl: '',
      location: 'home',
      backgroundColor: 'from-purple-900 to-blue-900',
      textColor: 'text-white',
      priority: 1,
      active: true
    }
  });
  
  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsAddingBanner(true);
    form.reset({
      title: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaUrl: '',
      location: 'home',
      backgroundColor: 'from-purple-900 to-blue-900',
      textColor: 'text-white',
      priority: 1,
      active: true
    });
  };
  
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setIsAddingBanner(true);
    form.reset(banner);
  };
  
  const handleSaveBanner = (data: Banner) => {
    if (editingBanner) {
      setBanners(banners.map(banner => 
        banner.id === editingBanner.id ? { ...data, id: editingBanner.id } : banner
      ));
      toast({
        title: "Banner updated",
        description: "The banner has been successfully updated."
      });
    } else {
      const newBanner = {
        ...data,
        id: Math.random().toString(36).substring(2, 9)
      };
      setBanners([...banners, newBanner]);
      toast({
        title: "Banner added",
        description: "The new banner has been successfully added."
      });
    }
    setIsAddingBanner(false);
  };
  
  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
    toast({
      title: "Banner deleted",
      description: "The banner has been successfully deleted."
    });
  };
  
  const handlePreviewBanner = (banner: Banner) => {
    setPreviewBanner(banner);
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]];
    setBanners(newBanners);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    setBanners(newBanners);
  };
  
  const handleToggleActive = (id: string, active: boolean) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, active } : banner
    ));
    toast({
      title: active ? "Banner activated" : "Banner deactivated",
      description: `The banner has been ${active ? 'activated' : 'deactivated'}.`
    });
  };
  
  const filteredBanners = activeTab === 'all' 
    ? banners 
    : banners.filter(banner => banner.location === activeTab);
  
  return (
    <div>
      <CMSPageHeader 
        title="Banner Management" 
        description="Manage promotional banners that appear throughout your website. Configure banners for the homepage, casino, slots, and sports sections."
      />
      
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleAddBanner}
          className="bg-casino-thunder-green hover:bg-green-600 text-white"
        >
          <Plus size={16} className="mr-2" /> Add New Banner
        </Button>
      </div>
      
      <CMSCard title="Banners by Location">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Banners</TabsTrigger>
            <TabsTrigger value="home">Homepage</TabsTrigger>
            <TabsTrigger value="casino">Casino Main</TabsTrigger>
            <TabsTrigger value="slots">Casino Slots</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Priority</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6"
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <span className="text-center">{banner.priority}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleMoveDown(index)}
                          disabled={index === filteredBanners.length - 1}
                          className="h-6 w-6"
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
                          {banner.imageUrl ? (
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div>{banner.title}</div>
                          <div className="text-xs text-gray-400">{banner.ctaText}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-slate-700">
                        {locationNames[banner.location] || banner.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={banner.active}
                        onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handlePreviewBanner(banner)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredBanners.length === 0 && (
              <div className="text-center py-8 bg-slate-800/50 rounded-lg">
                <LayoutGrid className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No banners found for this location</p>
                <Button 
                  onClick={handleAddBanner}
                  variant="outline" 
                  className="mt-4"
                >
                  <Plus size={16} className="mr-2" /> Add Banner
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Individual location tabs with same content structure */}
          {['home', 'casino', 'slots', 'sports'].map(location => (
            <TabsContent key={location} value={location} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Priority</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners
                    .filter(banner => banner.location === location)
                    .sort((a, b) => a.priority - b.priority)
                    .map((banner, index, filteredArray) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMoveUp(banners.indexOf(banner))}
                              disabled={index === 0}
                              className="h-6 w-6"
                            >
                              <ArrowUp size={14} />
                            </Button>
                            <span className="text-center">{banner.priority}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMoveDown(banners.indexOf(banner))}
                              disabled={index === filteredArray.length - 1}
                              className="h-6 w-6"
                            >
                              <ArrowDown size={14} />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
                              {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div>{banner.title}</div>
                              <div className="text-xs text-gray-400">{banner.ctaText}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={banner.active}
                            onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handlePreviewBanner(banner)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditBanner(banner)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {banners.filter(banner => banner.location === location).length === 0 && (
                <div className="text-center py-8 bg-slate-800/50 rounded-lg">
                  <LayoutGrid className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No banners found for {locationNames[location]}</p>
                  <Button 
                    onClick={() => {
                      handleAddBanner();
                      form.setValue('location', location);
                    }}
                    variant="outline" 
                    className="mt-4"
                  >
                    <Plus size={16} className="mr-2" /> Add Banner
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CMSCard>
      
      {/* Add/Edit Banner Dialog */}
      <Dialog open={isAddingBanner} onOpenChange={setIsAddingBanner}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingBanner ? 'Update the banner details below.' : 'Fill in the details to add a new promotional banner.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveBanner)} className="space-y-6">
              <BannerForm form={form} />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingBanner(false)}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-casino-thunder-green hover:bg-green-600 text-white"
                >
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Preview Banner Dialog */}
      <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>
          
          {previewBanner && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Banner Preview</h3>
                <div className={`bg-gradient-to-r ${previewBanner.backgroundColor} rounded-md p-2 relative aspect-[3/1] overflow-hidden`}>
                  {previewBanner.imageUrl && (
                    <div className="absolute inset-0 opacity-60 bg-black">
                      <img 
                        src={previewBanner.imageUrl} 
                        alt={previewBanner.title} 
                        className="w-full h-full object-cover mix-blend-overlay"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h2 className={`text-xl font-bold mb-2 ${previewBanner.textColor}`}>{previewBanner.title}</h2>
                    {previewBanner.description && (
                      <p className={`${previewBanner.textColor} mb-3 opacity-80`}>{previewBanner.description}</p>
                    )}
                    <Button size="sm" className="bg-casino-thunder-green hover:bg-green-600 text-white">
                      {previewBanner.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Location</h3>
                    <p>{locationNames[previewBanner.location] || previewBanner.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Status</h3>
                    <p>{previewBanner.active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Priority</h3>
                    <p>{previewBanner.priority}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">CTA</h3>
                    <p>{previewBanner.ctaText} → {previewBanner.ctaUrl}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setPreviewBanner(null)}
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

export default CMSBanners;
