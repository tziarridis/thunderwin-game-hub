
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BannerFormProps {
  form: any;
}

const BannerForm: React.FC<BannerFormProps> = ({ form }) => {
  return (
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
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter banner description" 
                  {...field} 
                  className="bg-slate-900 border-slate-700" 
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Keep it concise, 1-2 sentences max
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
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Location</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="home">Homepage</SelectItem>
                  <SelectItem value="casino">Casino Main</SelectItem>
                  <SelectItem value="slots">Casino Slots</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-gray-400">
                Select where this banner will be displayed
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Style</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="from-purple-900 to-blue-900">Purple to Blue</SelectItem>
                  <SelectItem value="from-green-800 to-blue-900">Green to Blue</SelectItem>
                  <SelectItem value="from-red-800 to-purple-900">Red to Purple</SelectItem>
                  <SelectItem value="from-amber-700 to-red-900">Amber to Red</SelectItem>
                  <SelectItem value="from-casino-thunder-green to-blue-900">Casino Green</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image</FormLabel>
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
              <FormDescription className="text-gray-400">
                Upload a high-quality image for the banner background
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="textColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text Color</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select text color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="text-white">White</SelectItem>
                  <SelectItem value="text-black">Black</SelectItem>
                  <SelectItem value="text-yellow-300">Yellow</SelectItem>
                  <SelectItem value="text-casino-thunder-green">Casino Green</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Priority</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  {...field} 
                  className="bg-slate-900 border-slate-700" 
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Lower numbers will be displayed first (1 is highest priority)
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BannerForm;
