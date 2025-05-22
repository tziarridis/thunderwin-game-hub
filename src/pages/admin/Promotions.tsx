// src/pages/admin/Promotions.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"
import { CalendarIcon } from "@radix-ui/react-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar"

import AdminPageLayout from "@/components/layout/AdminPageLayout";
import AdminPromotionCard from '@/components/admin/promotions/AdminPromotionCard';
// import { ConfirmationDialogProps } from "@/components/admin/shared/ConfirmationDialog"; // Removed
import ConfirmationDialog from "@/components/admin/shared/ConfirmationDialog"; // Import component
import { DatePicker } from "@/components/ui/date-picker"; // Assuming this is the correct DatePicker
import { CheckCircle2, XCircle, PlusCircle, Loader2, RefreshCw, CircleHelp } from 'lucide-react'; // Added icons
import { Promotion, PromotionType, PromotionStatus, PromotionAudience } from '@/types/promotion';
import { promotionService } from '@/services/promotionService';

const PromotionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Partial<Promotion> | null>(null);
  const [promotionToDeleteId, setPromotionToDeleteId] = useState<string | null>(null);

  const { data: promotions = [], isLoading, error, refetch } = useQuery<Promotion[], Error>({
    queryKey: ['adminPromotions'],
    queryFn: async () => {
        const response = await promotionService.getAllPromotions(); // Replace with actual service call
        return response.data || [];
        // return []; // Placeholder
    }
  });

  const promotionMutation = useMutation({
    mutationFn: async (promotionData: Partial<Promotion>) => {
      if (promotionData.id) {
        await promotionService.updatePromotion(promotionData.id, promotionData as Promotion);
      } else {
        await promotionService.createPromotion(promotionData as Promotion);
      }
      return Promise.resolve(); // Placeholder
    },
    // ... onSuccess, onError, invalidate queries
    onSuccess: () => {
      toast.success(`Promotion ${currentPromotion?.id ? 'updated' : 'created'} successfully.`);
      setIsModalOpen(false);
      setCurrentPromotion(null);
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
    },
    onError: (e: Error) => {
      toast.error(`Failed to save promotion: ${e.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await promotionService.deletePromotion(id);
      return Promise.resolve(); // Placeholder
    },
    // ... onSuccess, onError, invalidate queries
     onSuccess: () => {
      toast.success('Promotion deleted successfully.');
      setIsConfirmDeleteDialogOpen(false);
      setPromotionToDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
    },
    onError: (e: Error) => {
      toast.error(`Failed to delete promotion: ${e.message}`);
    },
  });
  
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      await promotionService.updatePromotion(id, { is_active: isActive } as Partial<Promotion>);
      return Promise.resolve(); // Placeholder
    },
    onSuccess: (data, variables) => {
      toast.success(`Promotion ${variables.isActive ? 'activated' : 'deactivated'}.`);
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
    },
    onError: (e: Error) => {
      toast.error(`Failed to toggle promotion status: ${e.message}`);
    },
  });


  const handleEdit = (promotion: Promotion) => {
    setCurrentPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleDelete = (promotionId: string) => {
    setPromotionToDeleteId(promotionId);
    setIsConfirmDeleteDialogOpen(true);
  };
  
  const handleToggleActive = (promotionId: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id: promotionId, isActive });
  };

  const confirmDelete = () => {
    if (promotionToDeleteId) {
      deleteMutation.mutate(promotionToDeleteId);
    }
  };

  const handleModalSubmit = (values: Partial<Promotion>) => {
    // Validate required fields before submitting
    if (!values.title || !values.type || !values.status || !values.valid_from || !values.valid_until) {
        toast.error("Please fill in all required fields: Title, Type, Status, Valid From, Valid Until.");
        return;
    }
    // Ensure dates are in ISO string format if needed by backend
    const promotionData = {
        ...currentPromotion, // existing data for updates
        ...values,
        valid_from: new Date(values.valid_from!).toISOString(),
        valid_until: new Date(values.valid_until!).toISOString(),
    };
    promotionMutation.mutate(promotionData);
  };
  
  const initialFormValues = currentPromotion 
    ? { 
        ...currentPromotion,
        valid_from: currentPromotion.valid_from ? format(new Date(currentPromotion.valid_from), "yyyy-MM-dd") : undefined,
        valid_until: currentPromotion.valid_until ? format(new Date(currentPromotion.valid_until), "yyyy-MM-dd") : undefined,
      } 
    : { type: 'deposit_bonus' as PromotionType, status: 'draft' as PromotionStatus, is_active: false };


  if (error) return <AdminPageLayout title="Manage Promotions"><div className="text-red-500 p-4">Error loading promotions: {error.message}</div></AdminPageLayout>;
  // ... rest of the component JSX, including the form modal
  return (
    <AdminPageLayout 
      title="Manage Promotions"
      headerActions={
        <div className="flex gap-2">
          <Button onClick={() => { setCurrentPromotion({ type: 'deposit_bonus', status: 'draft', is_active: false, title: '', description: '' }); setIsModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Promotion
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading || promotionMutation.isPending || deleteMutation.isPending || toggleActiveMutation.isPending}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      }
    >
      {isLoading && promotions.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading promotions...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-10">
          <CircleHelp className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-muted-foreground">No promotions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new promotion.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <AdminPromotionCard 
              key={promo.id} 
              promotion={promo} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) {setCurrentPromotion(null);} setIsModalOpen(open);}}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentPromotion?.id ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
            <DialogDescription>
              {currentPromotion?.id ? `Modifying promotion: ${currentPromotion.title}` : 'Fill in the details for the new promotion.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}> {/* Assuming 'form' is from react-hook-form, if not, remove Form wrapper */}
            <form onSubmit={form.handleSubmit(handleModalSubmit)} className="space-y-4 py-2 pb-4">
              {/* Form Fields: Title, Description, Type, Status etc. */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="E.g. Weekend Deposit Boost" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed description of the promotion..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* ... Other fields like type, status, value, code, dates ... */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select promotion type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {(Object.keys(promotionTypeIcons) as PromotionType[]).map(typeKey => (
                                <SelectItem key={typeKey} value={typeKey}>{typeKey.replace(/_/g, ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                             {(Object.keys(promotionStatusColors) as PromotionStatus[]).map(statusKey => (
                                <SelectItem key={statusKey} value={statusKey}>{statusKey.replace(/_/g, ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <DatePicker
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                            disabled={(date) => date < new Date("1900-01-01")} // Example disabled dates
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <DatePicker
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                            disabled={(date) => date < (form.getValues("valid_from") ? new Date(form.getValues("valid_from")) : new Date("1900-01-01"))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* value, bonus_percentage, free_spins_count, min_deposit, max_bonus_amount, wagering_requirement, code, cta_text, terms_and_conditions_url, target_audience, category, is_active */}
              {/* ... more form fields for these properties ... */}
                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-full">
                        <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                            Is this promotion currently active and visible to users?
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
                <Button type="button" variant="outline" onClick={() => {setIsModalOpen(false); setCurrentPromotion(null);}}>Cancel</Button>
                <Button type="submit" disabled={promotionMutation.isPending}>
                  {promotionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentPromotion?.id ? 'Save Changes' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        isDestructive
      />
    </AdminPageLayout>
  );
};

// Placeholder for react-hook-form setup, assuming it's similar to other forms in the project.
// This part would typically be outside the component or at the top.
const formSchema = z.object({ /* Zod schema for promotion fields */ 
    id: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    type: z.nativeEnum(PromotionTypeEnum), // Assuming PromotionTypeEnum exists or use z.string()
    status: z.nativeEnum(PromotionStatusEnum), // Assuming PromotionStatusEnum exists or use z.string()
    image_url: z.string().url().optional().or(z.literal('')),
    valid_from: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
    valid_until: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
    value: z.number().optional(),
    bonus_percentage: z.number().optional(),
    free_spins_count: z.number().optional(),
    min_deposit: z.number().optional(),
    max_bonus_amount: z.number().optional(),
    wagering_requirement: z.number().optional(),
    games: z.array(z.string()).optional(),
    code: z.string().optional(),
    cta_text: z.string().optional(),
    terms_and_conditions_url: z.string().url().optional().or(z.literal('')),
    target_audience: z.nativeEnum(PromotionAudienceEnum).optional(), // Assuming PromotionAudienceEnum exists
    category: z.string().optional(),
    is_active: z.boolean().default(false),
}).refine(data => {
    if (data.valid_from && data.valid_until) {
        return new Date(data.valid_until) > new Date(data.valid_from);
    }
    return true;
}, {
    message: "End date must be after start date",
    path: ["valid_until"], // Field to associate error with
});

// This requires PromotionTypeEnum, PromotionStatusEnum, PromotionAudienceEnum
// For now, I'll use simple string validation for enum-like fields if enums are not strictly defined for Zod
const PromotionTypeEnum = { 
    deposit_bonus: 'deposit_bonus',
    free_spins: 'free_spins',
    cashback_offer: 'cashback_offer',
    tournament: 'tournament',
    special_event: 'special_event',
    welcome_offer: 'welcome_offer',
    reload_bonus: 'reload_bonus'
 } as const;
const PromotionStatusEnum = { 
    active: 'active',
    inactive: 'inactive',
    upcoming: 'upcoming',
    expired: 'expired',
    draft: 'draft'
 } as const;
const PromotionAudienceEnum = { 
    all: 'all',
    new_users: 'new_users',
    vip_only: 'vip_only',
    segmented: 'segmented'
 } as const;

// Updated form schema with string fallbacks if enums are not set up for Zod
const robustFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  type: z.string(), // Was: z.nativeEnum(PromotionTypeEnum),
  status: z.string(), // Was: z.nativeEnum(PromotionStatusEnum),
  image_url: z.string().url().optional().or(z.literal('')),
  valid_from: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Valid start date is required" }),
  valid_until: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Valid end date is required" }),
  value: z.number().optional(),
  bonus_percentage: z.number().min(0).max(100).optional(),
  free_spins_count: z.number().int().min(0).optional(),
  min_deposit: z.number().min(0).optional(),
  max_bonus_amount: z.number().min(0).optional(),
  wagering_requirement: z.number().int().min(0).optional(),
  games: z.array(z.string()).optional(),
  code: z.string().optional().or(z.literal('')),
  cta_text: z.string().optional().or(z.literal('')),
  terms_and_conditions_url: z.string().url().optional().or(z.literal('')),
  target_audience: z.string().optional(), // Was: z.nativeEnum(PromotionAudienceEnum).optional(),
  category: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(false),
}).refine(data => {
    if (data.valid_from && data.valid_until) {
        return new Date(data.valid_until) >= new Date(data.valid_from);
    }
    return true;
}, {
    message: "End date must be on or after start date",
    path: ["valid_until"],
});


// Inside PromotionsPage component:
const queryClient = useQueryClient();
const form = useForm<z.infer<typeof robustFormSchema>>({
    resolver: zodResolver(robustFormSchema),
    defaultValues: initialFormValues as any, // Cast to any if initialFormValues doesn't perfectly match schema at init
});

useEffect(() => {
    if (currentPromotion) {
        form.reset({
            ...currentPromotion,
            valid_from: currentPromotion.valid_from ? format(new Date(currentPromotion.valid_from), "yyyy-MM-dd") : undefined,
            valid_until: currentPromotion.valid_until ? format(new Date(currentPromotion.valid_until), "yyyy-MM-dd") : undefined,
            // Ensure other fields match schema expectations, e.g., numbers for numeric fields
        });
    } else {
        form.reset({ type: 'deposit_bonus', status: 'draft', is_active: false, title: '', description: '' });
    }
}, [currentPromotion, form]);


export default PromotionsPage;
