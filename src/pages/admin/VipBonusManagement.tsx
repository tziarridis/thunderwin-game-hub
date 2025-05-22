
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { vipService, bonusService } from '@/services'; // Assuming these services exist
import { VIPLevel, Bonus, UserBonus } from '@/types';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import VipLevelManager from '@/components/admin/VipLevelManager'; // Assuming this component exists
import BonusForm from '@/components/admin/bonuses/BonusForm'; // Assuming this component exists
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Gift, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table'; // If listing bonuses/user_bonuses
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

// Mock services if not available
const mockVipService = {
  getVipLevels: async (): Promise<VIPLevel[]> => [{id: '1', name: 'Bronze', required_points: 0, benefits: [{description: 'Test benefit'}], created_at: new Date().toISOString(), updated_at: new Date().toISOString()}],
  updateVipLevel: async (id: string, data: Partial<VIPLevel>): Promise<VIPLevel> => ({id, name: data.name || 'Updated', required_points: data.required_points || 100, benefits: data.benefits || [], created_at: '', updated_at: ''}),
};
const mockBonusService = {
  getAllBonuses: async (): Promise<Bonus[]> => [{id: 'b1', name: 'Welcome Bonus', type: 'deposit_match', amount: 100, currency: 'USD', status: 'active', terms: 'Test terms', created_at: '', updated_at: ''}],
  createBonus: async (data: Omit<Bonus, 'id' | 'created_at' | 'updated_at'>): Promise<Bonus> => ({...data, id: 'new_bonus', created_at: '', updated_at: ''}),
  updateBonus: async (id: string, data: Partial<Bonus>): Promise<Bonus> => ({...data, id, name: data.name || 'Updated Bonus', created_at: '', updated_at: ''} as Bonus),
  deleteBonus: async (id: string): Promise<void> => {},
};
const vipService = mockVipService;
const bonusService = mockBonusService;


const VipBonusManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isBonusFormOpen, setIsBonusFormOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | Partial<Bonus> | null>(null);
  // State for VIP Level management if VipLevelManager is used directly or for a form

  const { data: vipLevels, isLoading: isLoadingVip, refetch: refetchVipLevels } = useQuery<VIPLevel[], Error>({
    queryKey: ['vipLevelsAdmin'],
    queryFn: vipService.getVipLevels,
  });

  const { data: bonuses, isLoading: isLoadingBonuses, refetch: refetchBonuses } = useQuery<Bonus[], Error>({
    queryKey: ['bonusesAdmin'],
    queryFn: bonusService.getAllBonuses,
  });

  const bonusMutation = useMutation({
    mutationFn: (bonusData: Bonus | Partial<Bonus>) => {
      if ((bonusData as Bonus).id) {
        return bonusService.updateBonus((bonusData as Bonus).id, bonusData as Partial<Bonus>);
      } else {
        return bonusService.createBonus(bonusData as Omit<Bonus, 'id'|'created_at'|'updated_at'>);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonusesAdmin'] });
      toast.success(`Bonus ${(selectedBonus as Bonus)?.id ? 'updated' : 'created'} successfully!`);
      setIsBonusFormOpen(false);
      setSelectedBonus(null);
    },
    onError: (error: Error) => {
      toast.error(`Bonus operation failed: ${error.message}`);
    },
  });
  
  const deleteBonusMutation = useMutation({
    mutationFn: (bonusId: string) => bonusService.deleteBonus(bonusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonusesAdmin'] });
      toast.success('Bonus deleted successfully!');
    },
    onError: (error: Error) => toast.error(`Failed to delete bonus: ${error.message}`),
  });


  const handleOpenBonusForm = (bonus?: Bonus) => {
    setSelectedBonus(bonus || {});
    setIsBonusFormOpen(true);
  };

  const handleSubmitBonusForm = (values: Bonus | Partial<Bonus>) => {
    bonusMutation.mutate(values);
  };
  
  const handleDeleteBonus = (bonusId: string) => {
    // Confirmation dialog recommended here
    deleteBonusMutation.mutate(bonusId);
  };

  const bonusColumns: ColumnDef<Bonus>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "amount", header: "Amount/Value" }, // Could be % or fixed
    { accessorKey: "status", header: "Status" },
    { 
      id: "actions",
      cell: ({row}) => (
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleOpenBonusForm(row.original)}><Edit className="h-4 w-4"/></Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteBonus(row.original.id)}><Trash2 className="h-4 w-4"/></Button>
        </div>
      )
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
        <Button onClick={() => handleOpenBonusForm()}>
            <Gift className="mr-2 h-4 w-4" /> Create New Bonus
        </Button>
        <Button onClick={() => { refetchVipLevels(); refetchBonuses(); }} variant="outline" disabled={isLoadingVip || isLoadingBonuses || bonusMutation.isPending || deleteBonusMutation.isPending}>
            { (isLoadingVip || isLoadingBonuses) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" /> }
            Refresh Data
        </Button>
    </div>
  );

  return (
    <AdminPageLayout title="VIP & Bonus Management" headerActions={headerActions}>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">VIP Level Management</h2>
        {isLoadingVip ? <Loader2 className="h-6 w-6 animate-spin" /> : <VipLevelManager levels={vipLevels || []} onSave={(id, data) => vipService.updateVipLevel(id, data)} />}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bonus Management</h2>
        </div>
        {isLoadingBonuses ? <Loader2 className="h-6 w-6 animate-spin" /> :
            <DataTable columns={bonusColumns} data={bonuses || []} />
        }
      </section>

      {isBonusFormOpen && (
        <BonusForm
          isOpen={isBonusFormOpen}
          onClose={() => setIsBonusFormOpen(false)}
          onSubmit={handleSubmitBonusForm}
          initialData={selectedBonus}
          isLoading={bonusMutation.isPending}
          // Pass other necessary props like available bonus types, conditions, etc.
        />
      )}
    </AdminPageLayout>
  );
};

export default VipBonusManagementPage;

