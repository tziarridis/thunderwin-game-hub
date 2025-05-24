
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminPromotionCard from '@/components/admin/promotions/AdminPromotionCard';
import { Promotion, PromotionFormValues } from '@/types/promotion';
import { Plus } from 'lucide-react';

// Mock service
const mockPromotionService = {
  getAllPromotions: async (): Promise<Promotion[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  },

  createPromotion: async (data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      id: 'new-promo', 
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  updatePromotion: async (id: string, data: Partial<Promotion>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, ...data };
  },

  deletePromotion: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

const AdminPromotions = () => {
  const { data: promotions, isLoading, error, refetch } = useQuery<Promotion[], Error>({
    queryKey: ['adminPromotions'],
    queryFn: mockPromotionService.getAllPromotions,
  });

  const handleCreatePromotion = async (formData: PromotionFormValues) => {
    try {
      const promotionData: Omit<Promotion, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        start_date: formData.valid_from,
        end_date: formData.valid_until,
      };
      await mockPromotionService.createPromotion(promotionData);
      refetch();
    } catch (error) {
      console.error('Error creating promotion:', error);
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    console.log('Edit promotion:', promotion);
  };

  const handleDeletePromotion = async (promotionId: string) => {
    try {
      await mockPromotionService.deletePromotion(promotionId);
      refetch();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleToggleActive = async (promotionId: string, isActive: boolean) => {
    try {
      await mockPromotionService.updatePromotion(promotionId, { is_active: isActive });
      refetch();
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotions Management</h1>
          <p className="text-muted-foreground">Create and manage promotional campaigns</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>Manage your promotional campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading promotions...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading promotions: {error.message}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions?.map((promotion) => (
                <AdminPromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  onEdit={handleEditPromotion}
                  onDelete={handleDeletePromotion}
                  onToggleActive={handleToggleActive}
                />
              ))}
              {(!promotions || promotions.length === 0) && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No promotions created yet. Create your first promotion to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromotions;
