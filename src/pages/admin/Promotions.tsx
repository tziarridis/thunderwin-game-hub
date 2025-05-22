
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService'; 
import { Promotion } from '@/types';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import AdminPromotionCard from '@/components/admin/promotions/AdminPromotionCard';
import PromotionForm from '@/components/admin/promotions/PromotionForm'; // Assuming this exists
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminPromotionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | Partial<Promotion> | null>(null); // Allow Partial for new

  const { data: promotions = [], isLoading, refetch } = useQuery<Promotion[], Error>({
    queryKey: ['adminPromotions'],
    queryFn: promotionService.getAllPromotions, // Assuming this fetches all for admin
  });

  const mutation = useMutation({
    mutationFn: async (promoData: Promotion | Partial<Promotion>) => {
      if ((promoData as Promotion).id) {
        return promotionService.updatePromotion((promoData as Promotion).id, promoData as Partial<Promotion>);
      } else {
        return promotionService.createPromotion(promoData as Omit<Promotion, 'id' | 'created_at' | 'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPromotions'] });
      toast.success(`Promotion ${(selectedPromotion as Promotion)?.id ? 'updated' : 'created'} successfully!`);
      setIsFormOpen(false);
      setSelectedPromotion(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (promoId: string) => promotionService.deletePromotion(promoId),
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

  const handleSubmitForm = (values: Promotion | Partial<Promotion>) => {
    mutation.mutate(values);
  };

  const headerActions = (
    <div className="flex gap-2">
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" /> Create Promotion
      </Button>
      <Button onClick={() => refetch()} variant="outline" disabled={isLoading || mutation.isPending || deleteMutation.isPending}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Refresh
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <AdminPageLayout title="Manage Promotions" headerActions={headerActions}>
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout title="Manage Promotions" headerActions={headerActions}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <AdminPromotionCard 
            key={promo.id} 
            promotion={promo} 
            onEdit={() => handleEdit(promo)}
            onDelete={() => handleDelete(promo)}
          />
        ))}
      </div>

      {isFormOpen && (
        <PromotionForm
          isOpen={isFormOpen} // Pass isOpen prop
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={selectedPromotion}
          isLoading={mutation.isPending}
          // isEditing={!!(selectedPromotion && (selectedPromotion as Promotion).id)} // Pass isEditing prop
        />
      )}
      
      {selectedPromotion && (selectedPromotion as Promotion).id && (
         <ConfirmationDialog
            isOpen={isConfirmOpen} // Pass isOpen prop
            onOpenChange={setIsConfirmOpen} // Pass onOpenChange prop
            title="Delete Promotion"
            description={`Are you sure you want to delete "${(selectedPromotion as Promotion).title}"?`}
            onConfirm={confirmDelete}
            isLoading={deleteMutation.isPending}
            isDestructive={true}
            confirmText="Delete"
        />
      )}
    </AdminPageLayout>
  );
};

export default AdminPromotionsPage;
