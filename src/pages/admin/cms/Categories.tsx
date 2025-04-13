
import React, { useState } from 'react';
import { Edit, Globe, Grid3x3, MinusCircle, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import CMSCard from '@/components/admin/cms/CMSCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  name: string;
  key: string;
  icon: string;
  visible: boolean;
  regionRestrictions: string[];
}

// Mock data
const regions = ['Global', 'Europe', 'Asia', 'Americas', 'Africa'];
const initialCategories: Category[] = [
  { 
    id: '1', 
    name: 'Slots', 
    key: 'slots', 
    icon: 'joystick', 
    visible: true, 
    regionRestrictions: [] 
  },
  { 
    id: '2', 
    name: 'Live Casino', 
    key: 'live-casino', 
    icon: 'video', 
    visible: true, 
    regionRestrictions: ['Asia'] 
  },
  { 
    id: '3', 
    name: 'Table Games', 
    key: 'table-games', 
    icon: 'layout-grid', 
    visible: true, 
    regionRestrictions: [] 
  },
  { 
    id: '4', 
    name: 'Jackpots', 
    key: 'jackpots', 
    icon: 'trophy', 
    visible: true, 
    regionRestrictions: [] 
  },
  { 
    id: '5', 
    name: 'New Games', 
    key: 'new-games', 
    icon: 'sparkles', 
    visible: true, 
    regionRestrictions: [] 
  },
];

const CMSCategories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  
  const form = useForm<Category>({
    defaultValues: {
      name: '',
      key: '',
      icon: '',
      visible: true,
      regionRestrictions: []
    }
  });
  
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsAddingCategory(true);
    form.reset({
      name: '',
      key: '',
      icon: '',
      visible: true,
      regionRestrictions: []
    });
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddingCategory(true);
    form.reset(category);
  };
  
  const handleSaveCategory = (data: Category) => {
    if (editingCategory) {
      setCategories(categories.map(category => 
        category.id === editingCategory.id ? { ...data, id: editingCategory.id } : category
      ));
      toast({
        title: "Category updated",
        description: "The category has been successfully updated."
      });
    } else {
      const newCategory = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        key: data.key || data.name.toLowerCase().replace(/\s+/g, '-')
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Category added",
        description: "The new category has been successfully added."
      });
    }
    setIsAddingCategory(false);
  };
  
  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(category => category.id !== id));
    toast({
      title: "Category deleted",
      description: "The category has been successfully deleted."
    });
  };
  
  const handleToggleVisible = (id: string, visible: boolean) => {
    setCategories(categories.map(category => 
      category.id === id ? { ...category, visible } : category
    ));
    toast({
      title: visible ? "Category visible" : "Category hidden",
      description: `The category is now ${visible ? 'visible' : 'hidden'} on the frontend.`
    });
  };
  
  return (
    <div>
      <CMSPageHeader 
        title="Dashboard Categories" 
        description="Manage and organize game categories shown to players on the frontend."
      />
      
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleAddCategory}
          className="bg-casino-thunder-green hover:bg-green-600 text-white"
        >
          <Plus size={16} className="mr-2" /> Add New Category
        </Button>
      </div>
      
      <CMSCard title="Game Categories">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Region Restrictions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Grid3x3 size={16} className="text-gray-400" />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-700">
                    <span className="text-sm">{category.icon}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={category.visible}
                    onCheckedChange={(checked) => handleToggleVisible(category.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  {category.regionRestrictions.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <Globe size={14} className="text-gray-400" />
                      <span className="text-xs">
                        {category.regionRestrictions.join(', ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No restrictions</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
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
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory ? 'Update the category details below.' : 'Fill in the details to add a new game category.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveCategory)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Slots, Live Casino" {...field} className="bg-slate-900 border-slate-700" />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      This will be displayed on the frontend
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Key</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. slots, live-casino" {...field} className="bg-slate-900 border-slate-700" />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Used in URLs (auto-generated if empty)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. joystick, cards" {...field} className="bg-slate-900 border-slate-700" />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Icon name from the icon library
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="visible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Visibility
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Show this category on the frontend
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
              
              <div>
                <FormLabel>Region Restrictions</FormLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {regions.map((region) => (
                    <FormField
                      key={region}
                      control={form.control}
                      name="regionRestrictions"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(region)}
                              onCheckedChange={(checked) => {
                                const updatedRegions = checked
                                  ? [...field.value || [], region]
                                  : field.value?.filter((value) => value !== region) || [];
                                field.onChange(updatedRegions);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {region}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormDescription className="text-gray-400 mt-2">
                  Select regions where this category should be hidden
                </FormDescription>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingCategory(false)}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-casino-thunder-green hover:bg-green-600 text-white"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CMSCategories;
