
import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Edit, 
  Eye, 
  ImageIcon, 
  Plus, 
  Trash2 
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  title: string;
  imageWeb: string;
  imageMobile: string;
  ctaText: string;
  ctaUrl: string;
  location: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

// Mocked data for demonstration
const initialBanners: Banner[] = [
  {
    id: '1',
    title: 'Welcome Bonus',
    imageWeb: '/placeholder.svg',
    imageMobile: '/placeholder.svg',
    ctaText: 'Claim Now',
    ctaUrl: '/promotions',
    location: 'Homepage',
    active: true,
    startDate: '2023-01-01',
    endDate: '2023-12-31'
  },
  {
    id: '2',
    title: 'Casino Tournament',
    imageWeb: '/placeholder.svg',
    imageMobile: '/placeholder.svg',
    ctaText: 'Join Now',
    ctaUrl: '/tournaments',
    location: 'Casino page',
    active: true,
  },
  {
    id: '3',
    title: 'VIP Program',
    imageWeb: '/placeholder.svg',
    imageMobile: '/placeholder.svg',
    ctaText: 'Learn More',
    ctaUrl: '/vip',
    location: 'Homepage',
    active: false,
  }
];

const CMSBanners = () => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const { toast } = useToast();
  
  const form = useForm<Banner>({
    defaultValues: {
      title: '',
      imageWeb: '',
      imageMobile: '',
      ctaText: '',
      ctaUrl: '',
      location: 'Homepage',
      active: true
    }
  });
  
  const handleAddBanner = () => {
    setEditingBanner(null);
    setIsAddingBanner(true);
    form.reset({
      title: '',
      imageWeb: '',
      imageMobile: '',
      ctaText: '',
      ctaUrl: '',
      location: 'Homepage',
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
  
  return (
    <div>
      <CMSPageHeader 
        title="Banner Management" 
        description="Manage promotional banners that appear throughout your website."
      />
      
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleAddBanner}
          className="bg-casino-thunder-green hover:bg-green-600 text-white"
        >
          <Plus size={16} className="mr-2" /> Add New Banner
        </Button>
      </div>
      
      <CMSCard title="Active Banners">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner, index) => (
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === banners.length - 1}
                      className="h-6 w-6"
                    >
                      <ArrowDown size={14} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                    {banner.title}
                  </div>
                </TableCell>
                <TableCell>{banner.location}</TableCell>
                <TableCell>
                  {banner.startDate && banner.endDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs">
                        {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No schedule</span>
                  )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter banner title" {...field} className="bg-slate-900 border-slate-700" />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Name for internal reference
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Homepage, Casino page" {...field} className="bg-slate-900 border-slate-700" />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Where the banner will be displayed
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ctaText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CTA Button Text</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Claim Now" {...field} className="bg-slate-900 border-slate-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ctaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CTA Button URL</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. /promotions" {...field} className="bg-slate-900 border-slate-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-slate-900 border-slate-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-slate-900 border-slate-700" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Status
                          </FormLabel>
                          <FormDescription className="text-gray-400">
                            Whether the banner is currently displayed
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageWeb"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Web Banner Image</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <div className="h-32 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                              <div className="text-center p-4">
                                <ImageIcon size={40} className="mx-auto text-gray-500 mb-2" />
                                <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                                  Upload Image
                                </Button>
                                <p className="text-xs mt-2 text-gray-400">Recommended: 1200×400px</p>
                              </div>
                            </div>
                            <Input type="hidden" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Banner Image</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            <div className="h-28 bg-slate-900 border border-dashed border-slate-700 rounded-md flex items-center justify-center">
                              <div className="text-center p-4">
                                <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
                                <Button type="button" variant="outline" size="sm" className="bg-slate-800">
                                  Upload Image
                                </Button>
                                <p className="text-xs mt-2 text-gray-400">Recommended: 600×400px</p>
                              </div>
                            </div>
                            <Input type="hidden" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
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
                <h3 className="text-sm font-medium text-gray-400 mb-1">Desktop View</h3>
                <div className="bg-slate-900 rounded-md p-2 relative aspect-[3/1] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <ImageIcon size={40} className="text-gray-500" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold mb-2">{previewBanner.title}</h2>
                    <Button size="sm" className="bg-casino-thunder-green hover:bg-green-600 text-white">
                      {previewBanner.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Mobile View</h3>
                <div className="bg-slate-900 rounded-md p-2 relative aspect-[1/1] max-w-[200px] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                    <ImageIcon size={24} className="text-gray-500" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <h2 className="text-sm font-bold mb-1">{previewBanner.title}</h2>
                    <Button size="sm" className="bg-casino-thunder-green hover:bg-green-600 text-white text-xs h-7">
                      {previewBanner.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Location</h3>
                    <p>{previewBanner.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Status</h3>
                    <p>{previewBanner.active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">CTA</h3>
                    <p>{previewBanner.ctaText} → {previewBanner.ctaUrl}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Schedule</h3>
                    <p>
                      {previewBanner.startDate && previewBanner.endDate ? 
                        `${new Date(previewBanner.startDate).toLocaleDateString()} - ${new Date(previewBanner.endDate).toLocaleDateString()}` : 
                        'No schedule set'}
                    </p>
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
