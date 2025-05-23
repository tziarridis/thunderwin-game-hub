
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { promotionsService } from '@/services/promotionService'; // Corrected: promotionsService
import { Promotion, PromotionFormValues } from '@/types'; // PromotionFormValues if defined, or use Partial<Promotion>
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import AdminPromotionCard from '@/components/admin/promotions/AdminPromotionCard'; // Assuming this exists and is correct
import PromotionForm from '@/components/admin/promotions/PromotionForm'; // Assuming this exists and is correct
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPromotionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | Partial<Promotion> | null>(null);

  const { data: promotions = [], isLoading, refetch } = useQuery<Promotion[], Error, Promotion[], QueryKey>({
    queryKey: ['adminPromotions'] as QueryKey,
    queryFn: promotionsService.getAllPromotions, // Ensure this method returns Promotion[]
  });

  const mutation = useMutation({
    mutationFn: async (promoData: PromotionFormValues | Partial<Promotion>) => { // Use a defined form values type or Partial<Promotion>
      // Assert promoData has an id if it's an update
      const currentId = (promoData as Promotion).id;
      if (currentId) {
        return promotionsService.updatePromotion(currentId, promoData as Partial<Promotion>);
      } else {
        // For creation, ensure the type matches createPromotion's expected input
        return promotionsService.createPromotion(promoData as Omit<Promotion, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
      toast.success(`Promotion ${selectedPromotion && (selectedPromotion as Promotion).id ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      setSelectedPromotion(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (promoId: string) => promotionsService.deletePromotion(promoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
      toast.success('Promotion deleted successfully!');
      setIsConfirmOpen(false);
      setSelectedPromotion(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete promotion: ${error.message}`);
    },
  });

  const handleAddNew = () => {
    setSelectedPromotion({}); // For new promotion
    setIsFormOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setIsFormOpen(true);
  };

  const handleDelete = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPromotion && (selectedPromotion as Promotion).id) {
      deleteMutation.mutate((selectedPromotion as Promotion).id);
    }
  };

  const handleSubmitForm = (values: PromotionFormValues | Partial<Promotion>) => {
    mutation.mutate(values);
  };

  const headerActions = (
    <div className="flex gap-2">
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" /> Create Promotion
      </Button>
      <Button 
        onClick={() => refetch()} 
        variant="outline" 
        disabled={isLoading || mutation.isPending || deleteMutation.isPending}
      >
        {isLoading || mutation.isPending || deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <AdminPageLayout title="Manage Promotions" headerActions={headerActions}>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageLayout>
    );
  }
  
  // Assuming PromotionForm is read-only and has props: isOpen, onClose, onSubmit, initialData, isLoading
  const AnyPromotionForm = PromotionForm as any;
  const AnyAdminPromotionCard = AdminPromotionCard as any;


  return (
    <AdminPageLayout title="Manage Promotions" headerActions={headerActions}>
      {promotions.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">No promotions found.</p>
          <p className="text-sm text-muted-foreground">Click "Create Promotion" to get started.</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <AnyAdminPromotionCard
            key={promo.id}
            promotion={promo}
            onEdit={() => handleEdit(promo)}
            onDelete={() => handleDelete(promo)}
            // Pass any other required props for AdminPromotionCard
          />
        ))}
      </div>

      {isFormOpen && (
        <AnyPromotionForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)} // Common prop for closing dialogs
          onSubmit={handleSubmitForm}
          initialData={selectedPromotion} // Pass the selected promotion
          isLoading={mutation.isPending}
          // Add other required props for PromotionForm here if known
        />
      )}

      {selectedPromotion && (selectedPromotion as Promotion).id && (
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)} // Use onClose
          title="Delete Promotion"
          description={`Are you sure you want to delete "${(selectedPromotion as Promotion).title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
          isDestructive // Keep if this is a valid prop for your ConfirmationDialog
          confirmText="Delete"
        />
      )}
    </AdminPageLayout>
  );
};

export default AdminPromotionsPage;
