// Fix the duplicate property error on line 145
// We need to update the create bonus function to use the correct parameter names

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Check, Plus, RefreshCw, Trash2, Gift, Tag, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { bonusService } from '@/services/bonusService';
import { BonusTemplate, BonusType } from '@/types';

const BonusManagement = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form schema for creating/editing bonus templates
  const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string().min(5, { message: "Description must be at least 5 characters." }),
    type: z.string(),
    value: z.coerce.number().min(1, { message: "Value must be at least 1." }),
    percentage: z.boolean().default(false),
    minDeposit: z.coerce.number().optional(),
    wageringRequirement: z.coerce.number().min(0),
    durationDays: z.coerce.number().min(1, { message: "Duration must be at least 1 day." }),
    vipLevels: z.array(z.number()).default([]),
    isActive: z.boolean().default(true),
    bonusType: z.string().optional(),
    amount: z.coerce.number().optional(),
    wagering: z.coerce.number().optional(),
    expiryDays: z.coerce.number().optional(),
    maxBonus: z.coerce.number().optional(),
    vipLevelRequired: z.union([z.string(), z.number()]).optional(),
    allowedGames: z.string().optional(),
    code: z.string().optional()
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: BonusType.WELCOME,
      value: 100,
      percentage: true,
      minDeposit: 10,
      wageringRequirement: 35,
      durationDays: 30,
      vipLevels: [1, 2, 3],
      isActive: true
    }
  });
  
  // Load bonus templates
  useEffect(() => {
    const fetchBonusTemplates = async () => {
      try {
        setLoading(true);
        const templates = await bonusService.getBonusTemplates();
        setBonusTemplates(templates);
      } catch (error) {
        console.error('Error fetching bonus templates:', error);
        toast.error('Failed to load bonus templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBonusTemplates();
  }, []);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Convert the form data to match the CreateBonusTemplateParams interface
      const templateData = {
        name: data.name,
        description: data.description,
        type: data.type as BonusType,
        value: data.value,
        percentage: data.percentage,
        minDepositAmount: data.minDeposit,
        maxBonusAmount: data.maxBonus,
        wageringRequirement: data.wageringRequirement,
        durationDays: data.durationDays,
        forVipLevels: data.vipLevels
      };
      
      const newTemplate = await bonusService.createBonusTemplate(templateData);
      
      if (newTemplate) {
        setBonusTemplates(prev => [...prev, newTemplate]);
        toast.success('Bonus template created successfully');
        form.reset();
      } else {
        toast.error('Failed to create bonus template');
      }
    } catch (error) {
      console.error('Error creating bonus template:', error);
      toast.error('Failed to create bonus template');
    }
  };
  
  // Handle deleting a bonus template
  const handleDelete = async (id: string) => {
    // This would normally call an API to delete the template
    setBonusTemplates(prev => prev.filter(template => template.id !== id));
    toast.success('Bonus template deleted');
  };
  
  // Handle toggling the active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // This would normally call an API to update the template
    setBonusTemplates(prev => 
      prev.map(template => 
        template.id === id ? { ...template, isActive: !currentStatus } : template
      )
    );
    toast.success(`Bonus ${currentStatus ? 'deactivated' : 'activated'}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonus Management</h1>
          <p className="text-muted-foreground">Create and manage bonus offers for your players.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus size={16} />
              <span>New Bonus</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Bonus</DialogTitle>
              <DialogDescription>
                Set up a new bonus template that can be assigned to players.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonus Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Welcome Bonus 100%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bonus type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(BonusType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Amount or percentage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="percentage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Is Percentage</FormLabel>
                          <FormDescription>
                            If enabled, value is a percentage
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
                  
                  <FormField
                    control={form.control}
                    name="wageringRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wagering Requirement</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Times the bonus amount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Deposit</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description for the bonus that will be visible to players" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          If enabled, the bonus can be assigned to players
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
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Create Bonus</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Bonus Templates</TabsTrigger>
          <TabsTrigger value="active">Active Bonuses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Available Bonus Templates</CardTitle>
              <CardDescription>
                These templates can be assigned to players as bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center my-8">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Bonus</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[100px]">Value</TableHead>
                        <TableHead className="w-[100px]">Wagering</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bonusTemplates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No bonus templates found. Create your first one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bonusTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">
                              <div>{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Gift size={16} className="mr-1" />
                                <span>{template.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Tag size={16} className="mr-1" />
                                <span>
                                  {template.percentage ? `${template.value}%` : template.value}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <RefreshCw size={16} className="mr-1" />
                                <span>{template.wageringRequirement}x</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                <span>{template.durationDays} days</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${
                                template.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  template.isActive ? 'bg-green-400' : 'bg-red-400'
                                }`}></div>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => handleToggleActive(template.id, template.isActive)}
                                >
                                  <Check size={16} className="text-green-400" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleDelete(template.id)}
                                >
                                  <Trash2 size={16} className="text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active User Bonuses</CardTitle>
              <CardDescription>
                Currently active bonuses for players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No active user bonuses found.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bonus System Settings</CardTitle>
              <CardDescription>
                Configure global bonus settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Settings size={24} className="text-muted-foreground" />
                <p className="text-muted-foreground">Bonus system settings will be implemented soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonusManagement;
