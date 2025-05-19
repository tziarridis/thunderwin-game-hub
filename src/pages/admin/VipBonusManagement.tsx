import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VipLevel, Bonus, User } from '@/types';
import { adminService } from '@/services/adminService'; // Assuming adminService handles these
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, Search, Gift, ShieldCheck, Users, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox import

// Define types for form data
interface VipLevelFormData {
  name: string;
  required_points: number;
  description?: string;
  icon?: string;
  // other relevant fields
}

const VipLevelForm: React.FC<{ level?: VipLevel; onSuccess: () => void; onCancel: () => void }> = ({ level, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<VipLevelFormData>({
    name: level?.name || '',
    required_points: level?.required_points || 0,
    description: level?.description || '',
    icon: level?.icon || '',
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: VipLevelFormData) => 
      level?.id 
        ? adminService.updateVipLevel(level.id, data) 
        : adminService.createVipLevel(data),
    onSuccess: () => {
      toast.success(`VIP Level ${level?.id ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['vipLevels'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Could not save VIP Level.'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vipName">Level Name</Label>
        <Input id="vipName" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div>
        <Label htmlFor="vipPoints">Required Points</Label>
        <Input id="vipPoints" type="number" value={formData.required_points} onChange={e => setFormData({...formData, required_points: parseInt(e.target.value) || 0})} required />
      </div>
      <div>
        <Label htmlFor="vipDescription">Description (Optional)</Label>
        <Input id="vipDescription" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div>
        <Label htmlFor="vipIcon">Icon (Lucide Name, e.g., Star)</Label>
        <Input id="vipIcon" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {level?.id ? 'Update Level' : 'Create Level'}
        </Button>
      </DialogFooter>
    </form>
  );
};


interface BonusFormData {
  name: string;
  description?: string;
  type: 'deposit' | 'free_spins' | 'cashback' | 'loyalty_points';
  amount?: number; // For cash amounts or percentage
  currency?: string;
  free_spins_count?: number;
  game_id?: string; // For free spins on specific game
  wagering_requirement?: number;
  validity_days?: number;
  vip_level_id?: string; // Link bonus to a VIP level
  is_active: boolean;
  code?: string; // Optional bonus code
}

const BonusForm: React.FC<{ bonus?: Bonus; vipLevels: VipLevel[]; onSuccess: () => void; onCancel: () => void }> = ({ bonus, vipLevels, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BonusFormData>({
    name: bonus?.name || '',
    description: bonus?.description || '',
    type: bonus?.type || 'deposit',
    amount: bonus?.amount || undefined,
    currency: bonus?.currency || 'USD',
    free_spins_count: bonus?.free_spins_count || undefined,
    game_id: bonus?.game_id || undefined,
    wagering_requirement: bonus?.wagering_requirement || 0,
    validity_days: bonus?.validity_days || 30,
    vip_level_id: bonus?.vip_level_id || undefined,
    is_active: bonus?.is_active === undefined ? true : bonus.is_active,
    code: bonus?.code || '',
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BonusFormData) => 
      bonus?.id 
        ? adminService.updateBonus(bonus.id, data) 
        : adminService.createBonus(data),
    onSuccess: () => {
      toast.success(`Bonus ${bonus?.id ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Could not save Bonus.'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name, Description, Type, Amount, Currency, Free Spins, Game ID, Wagering, Validity, VIP Level, Active, Code */}
      <div><Label htmlFor="bonusName">Bonus Name</Label><Input id="bonusName" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
      <div><Label htmlFor="bonusDescription">Description</Label><Input id="bonusDescription" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
      <div>
        <Label htmlFor="bonusType">Type</Label>
        <Select value={formData.type} onValueChange={value => setFormData({...formData, type: value as BonusFormData['type']})}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="deposit">Deposit Bonus</SelectItem>
            <SelectItem value="free_spins">Free Spins</SelectItem>
            <SelectItem value="cashback">Cashback</SelectItem>
            <SelectItem value="loyalty_points">Loyalty Points</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.type === 'deposit' && (
        <>
          <div><Label htmlFor="bonusAmount">Amount/Percentage</Label><Input id="bonusAmount" type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || undefined})} /></div>
          <div><Label htmlFor="bonusCurrency">Currency</Label><Input id="bonusCurrency" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} /></div>
        </>
      )}
      {formData.type === 'free_spins' && (
        <>
         <div><Label htmlFor="freeSpinsCount">Free Spins Count</Label><Input id="freeSpinsCount" type="number" value={formData.free_spins_count || ''} onChange={e => setFormData({...formData, free_spins_count: parseInt(e.target.value) || undefined})} /></div>
         <div><Label htmlFor="bonusGameId">Game ID (for spins)</Label><Input id="bonusGameId" value={formData.game_id || ''} onChange={e => setFormData({...formData, game_id: e.target.value})} /></div>
        </>
      )}
      <div><Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label><Input id="wageringRequirement" type="number" value={formData.wagering_requirement || ''} onChange={e => setFormData({...formData, wagering_requirement: parseInt(e.target.value) || 0})} /></div>
      <div><Label htmlFor="validityDays">Validity (days)</Label><Input id="validityDays" type="number" value={formData.validity_days || ''} onChange={e => setFormData({...formData, validity_days: parseInt(e.target.value) || 30})} /></div>
      <div>
        <Label htmlFor="vipLevelId">VIP Level (Optional)</Label>
        <Select value={formData.vip_level_id || ""} onValueChange={value => setFormData({...formData, vip_level_id: value || undefined })}>
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {vipLevels.map(vl => <SelectItem key={vl.id} value={vl.id.toString()}>{vl.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="bonusIsActive" checked={formData.is_active} onCheckedChange={checked => setFormData({...formData, is_active: Boolean(checked)})} />
        <Label htmlFor="bonusIsActive">Active</Label>
      </div>
      <div><Label htmlFor="bonusCode">Bonus Code (Optional)</Label><Input id="bonusCode" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {bonus?.id ? 'Update Bonus' : 'Create Bonus'}
        </Button>
      </DialogFooter>
    </form>
  );
};


const UserBonusAssignment: React.FC<{ users: User[]; bonuses: Bonus[]; onSuccess: () => void; onCancel: () => void }> = ({ users, bonuses, onSuccess, onCancel }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedBonusId, setSelectedBonusId] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { userId: string; bonusId: string }) => 
      adminService.assignBonusToUser(data.userId, data.bonusId),
    onSuccess: () => {
      toast.success("Bonus assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ['userBonuses'] }); // Or a more specific key
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message || 'Could not assign bonus.'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && selectedBonusId) {
      mutation.mutate({ userId: selectedUserId, bonusId: selectedBonusId });
    } else {
      toast.error("Please select a user and a bonus.");
    }
  };

  return (
     <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="selectUser">User</Label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger id="selectUser"><SelectValue placeholder="Select user" /></SelectTrigger>
          <SelectContent>
            {users.map(user => <SelectItem key={user.id} value={user.id.toString()}>{user.username || user.email}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="selectBonus">Bonus</Label>
        <Select value={selectedBonusId} onValueChange={setSelectedBonusId}>
          <SelectTrigger id="selectBonus"><SelectValue placeholder="Select bonus" /></SelectTrigger>
          <SelectContent>
            {bonuses.filter(b => b.is_active).map(bonus => <SelectItem key={bonus.id} value={bonus.id.toString()}>{bonus.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending || !selectedUserId || !selectedBonusId}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign Bonus
        </Button>
      </DialogFooter>
    </form>
  );
};


const VipBonusManagement: React.FC = () => {
  // State for managing modals and editing
  const [isVipLevelModalOpen, setIsVipLevelModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isAssignBonusModalOpen, setIsAssignBonusModalOpen] = useState(false);
  const [editingVipLevel, setEditingVipLevel] = useState<VipLevel | undefined>(undefined);
  const [editingBonus, setEditingBonus] = useState<Bonus | undefined>(undefined);

  const queryClient = useQueryClient();

  const { data: vipLevels = [], isLoading: isLoadingVipLevels, error: vipLevelsError } = useQuery<VipLevel[], Error>({
    queryKey: ['vipLevels'],
    queryFn: adminService.getVipLevels
  });
  const { data: bonuses = [], isLoading: isLoadingBonuses, error: bonusesError } = useQuery<Bonus[], Error>({
    queryKey: ['bonuses'],
    queryFn: adminService.getBonuses
  });
   const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<User[], Error>({
    queryKey: ['allUsersForBonuses'], // A more specific key might be needed
    queryFn: adminService.getUsers // Assuming adminService.getUsers fetches all users
  });


  const deleteVipLevelMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteVipLevel(id),
    onSuccess: () => {
      toast.success("VIP Level deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['vipLevels'] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete VIP Level.")
  });

  const deleteBonusMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBonus(id),
    onSuccess: () => {
      toast.success("Bonus deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete Bonus.")
  });

  const handleOpenVipLevelModal = (level?: VipLevel) => {
    setEditingVipLevel(level);
    setIsVipLevelModalOpen(true);
  };

  const handleOpenBonusModal = (bonus?: Bonus) => {
    setEditingBonus(bonus);
    setIsBonusModalOpen(true);
  };
  
  const renderLoading = () => (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading data...</p>
    </div>
  );

  if (isLoadingVipLevels || isLoadingBonuses || isLoadingUsers) return renderLoading();
  if (vipLevelsError) return <p className="text-red-500">Error loading VIP levels: {vipLevelsError.message}</p>;
  if (bonusesError) return <p className="text-red-500">Error loading bonuses: {bonusesError.message}</p>;
  if (usersError) return <p className="text-red-500">Error loading users: {usersError.message}</p>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">VIP & Bonus Management</h1>

      {/* VIP Levels Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-primary" />VIP Levels</CardTitle>
            <CardDescription>Manage player VIP tiers and their requirements.</CardDescription>
          </div>
          <Button onClick={() => handleOpenVipLevelModal()}><PlusCircle className="mr-2 h-4 w-4"/>Add VIP Level</Button>
        </CardHeader>
        <CardContent>
          {vipLevels.length === 0 ? (
            <p>No VIP levels configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Required Points</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vipLevels.map(level => (
                  <TableRow key={level.id}>
                    <TableCell>{level.name}</TableCell>
                    <TableCell>{level.required_points}</TableCell>
                    <TableCell>{level.description}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenVipLevelModal(level)}><Edit className="h-4 w-4"/></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteVipLevelMutation.mutate(level.id.toString())} disabled={deleteVipLevelMutation.isPending}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bonuses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><Gift className="mr-2 h-6 w-6 text-primary" />Bonuses</CardTitle>
            <CardDescription>Create and manage bonuses for players.</CardDescription>
          </div>
          <Button onClick={() => handleOpenBonusModal()}><PlusCircle className="mr-2 h-4 w-4"/>Add Bonus</Button>
        </CardHeader>
        <CardContent>
           {bonuses.length === 0 ? (
            <p>No bonuses configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount/Spins</TableHead>
                  <TableHead>Wagering (x)</TableHead>
                  <TableHead>VIP Level</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonuses.map(bonus => (
                  <TableRow key={bonus.id}>
                    <TableCell>{bonus.name}</TableCell>
                    <TableCell className="capitalize">{bonus.type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      {bonus.type === 'free_spins' ? `${bonus.free_spins_count} spins` : `${bonus.amount || '-'} ${bonus.currency || ''}`}
                    </TableCell>
                    <TableCell>{bonus.wagering_requirement}</TableCell>
                    <TableCell>{vipLevels.find(vl => vl.id === bonus.vip_level_id)?.name || 'Any'}</TableCell>
                    <TableCell>{bonus.is_active ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldCheck className="h-5 w-5 text-red-500" />}</TableCell>
                    <TableCell>{bonus.code || '-'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenBonusModal(bonus)}><Edit className="h-4 w-4"/></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteBonusMutation.mutate(bonus.id.toString())} disabled={deleteBonusMutation.isPending}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Bonus to User Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Assign Bonus to User</CardTitle>
            <CardDescription>Manually assign an active bonus to a specific user.</CardDescription>
          </div>
          <Button onClick={() => setIsAssignBonusModalOpen(true)}><DollarSign className="mr-2 h-4 w-4"/>Assign Bonus</Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Use the "Assign Bonus" button to select a user and an active bonus to grant.</p>
          {/* Optionally, list recently assigned bonuses here */}
        </CardContent>
      </Card>


      {/* Modals */}
      <Dialog open={isVipLevelModalOpen} onOpenChange={setIsVipLevelModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingVipLevel ? 'Edit' : 'Create'} VIP Level</DialogTitle></DialogHeader>
          <VipLevelForm 
            level={editingVipLevel} 
            onSuccess={() => setIsVipLevelModalOpen(false)} 
            onCancel={() => setIsVipLevelModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBonusModalOpen} onOpenChange={setIsBonusModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBonus ? 'Edit' : 'Create'} Bonus</DialogTitle></DialogHeader>
          <BonusForm 
            bonus={editingBonus} 
            vipLevels={vipLevels} 
            onSuccess={() => setIsBonusModalOpen(false)} 
            onCancel={() => setIsBonusModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignBonusModalOpen} onOpenChange={setIsAssignBonusModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Bonus to User</DialogTitle></DialogHeader>
          {users.length > 0 && bonuses.filter(b=>b.is_active).length > 0 ? (
            <UserBonusAssignment 
                users={users} 
                bonuses={bonuses.filter(b => b.is_active)} 
                onSuccess={() => setIsAssignBonusModalOpen(false)} 
                onCancel={() => setIsAssignBonusModalOpen(false)} 
            />
          ) : (
            <p className="text-center text-muted-foreground py-4">
                {users.length === 0 && "No users available. "}
                {bonuses.filter(b=>b.is_active).length === 0 && "No active bonuses available to assign."}
            </p>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default VipBonusManagement;
