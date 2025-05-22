import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VipLevel } from '@/types/vip';
import { Bonus } from '@/types/bonus'; // Bonus type from bonus.ts
import VipLevelManager, { VipLevelManagerProps } from '@/components/admin/VipLevelManager'; 
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // For loading indicators

// Mock service, replace with actual service calls
const mockVipService = {
  getVipLevels: async (): Promise<VipLevel[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Example data, ensure it matches VipLevel type
    return [
      { id: "1", level: 1, name: 'Bronze', min_points: 0, cashback_percentage: 1, bonus_percentage: 5, benefits_description: "Basic benefits", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "2", level: 2, name: 'Silver', min_points: 1000, cashback_percentage: 2, bonus_percentage: 10, benefits_description: "Better benefits", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "3", level: 3, name: 'Gold', min_points: 5000, cashback_percentage: 3, bonus_percentage: 15, benefits_description: "Premium benefits", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  },
  updateVipLevel: async (level: VipLevel): Promise<VipLevel> => {
    console.log("Updating VIP Level:", level);
    toast.success(`VIP Level ${level.name} updated (mock).`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {...level, updated_at: new Date().toISOString()};
  },
  addVipLevel: async (levelData: Omit<VipLevel, 'id' | 'created_at' | 'updated_at'>): Promise<VipLevel> => {
    const newLevel: VipLevel = { 
        ...levelData, 
        id: String(Date.now()), 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
    };
    console.log("Adding VIP Level:", newLevel);
    toast.success(`VIP Level ${newLevel.name} added (mock).`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return newLevel;
  }
};

const mockBonusService = {
  getBonusesForVipLevel: async (levelId: string | number): Promise<Bonus[]> => {
    console.log("Fetching bonuses for VIP level:", levelId);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Example data, ensure it matches Bonus type
    return [
      { id: "b1", name: 'Bronze Welcome Bonus', description: 'Get 50 free spins', type: 'free_spins', status: 'active', vip_level_required: "1", free_spins_count: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "b2", name: 'Silver Reload Bonus', description: '10% reload up to $50', type: 'deposit', amount: 50, percentage: 10, status: 'active', vip_level_required: "2", max_bonus_amount: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ].filter(b => String(b.vip_level_required) === String(levelId));
  },
  // Add mock functions for addBonus, updateBonus if needed
};


const VipBonusManagement = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<VipLevel | null>(null); // For VipLevelManager

  useEffect(() => {
    const fetchLevels = async () => {
      setIsLoadingLevels(true);
      try {
        const levels = await mockVipService.getVipLevels();
        setVipLevels(levels);
      } catch (error) {
        toast.error("Failed to load VIP levels.");
        console.error(error);
      } finally {
        setIsLoadingLevels(false);
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    if (selectedLevel?.id) {
      const fetchBonuses = async () => {
        setIsLoadingBonuses(true);
        try {
          const levelBonuses = await mockBonusService.getBonusesForVipLevel(selectedLevel.id);
          setBonuses(levelBonuses);
        } catch (error) {
          toast.error(`Failed to load bonuses for ${selectedLevel.name}.`);
          console.error(error);
        } finally {
          setIsLoadingBonuses(false);
        }
      };
      fetchBonuses();
    } else {
      setBonuses([]);
    }
  }, [selectedLevel]);

  const handleSaveVipLevel = async (levelData: VipLevel | Omit<VipLevel, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoadingLevels(true); // Or a specific submitting state for the modal
    try {
      let savedLevel;
      if ('id' in levelData && levelData.id) { // Existing level
        savedLevel = await mockVipService.updateVipLevel(levelData as VipLevel);
        setVipLevels(prev => prev.map(l => l.id === savedLevel.id ? savedLevel : l));
        if (selectedLevel?.id === savedLevel.id) setSelectedLevel(savedLevel); // Update selected if it was edited
      } else { // New level
        savedLevel = await mockVipService.addVipLevel(levelData as Omit<VipLevel, 'id' | 'created_at' | 'updated_at'>);
        setVipLevels(prev => [...prev, savedLevel].sort((a,b) => a.level - b.level));
      }
      setIsLevelModalOpen(false);
      setEditingLevel(null);
    } catch (error:any) {
      toast.error(`Failed to save VIP level: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoadingLevels(false);
    }
  };
  
  const openAddLevelModal = () => {
    setEditingLevel(null); 
    setIsLevelModalOpen(true);
  };

  const openEditLevelModal = (level: VipLevel) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };
  
  const vipLevelManagerProps: VipLevelManagerProps = {
    // `level` will be set dynamically before rendering VipLevelManager
    onSave: handleSaveVipLevel,
    onClose: () => { setIsLevelModalOpen(false); setEditingLevel(null); },
    isLoading: isLoadingLevels, // Or a more specific loading state for the modal
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">VIP & Bonus Management</h1>

      {/* VIP Levels Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>VIP Levels</CardTitle>
              <CardDescription>Manage VIP tiers and their point requirements.</CardDescription>
            </div>
            <Button onClick={openAddLevelModal} disabled={isLoadingLevels}>
                {isLoadingLevels && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Add VIP Level
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLevels && vipLevels.length === 0 ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/> <span className="ml-2">Loading VIP levels...</span></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Min Points</TableHead>
                  <TableHead>Cashback (%)</TableHead>
                  <TableHead>Bonus (%)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vipLevels.sort((a,b) => a.level - b.level).map((level) => (
                  <TableRow 
                    key={level.id} 
                    onClick={() => setSelectedLevel(level)}
                    className={`${selectedLevel?.id === level.id ? "bg-muted/50" : "hover:bg-muted/30"} cursor-pointer`}
                  >
                    <TableCell>{level.level}</TableCell>
                    <TableCell>{level.name}</TableCell>
                    <TableCell>{level.min_points}</TableCell>
                    <TableCell>{level.cashback_percentage ?? 'N/A'}%</TableCell>
                    <TableCell>{level.bonus_percentage ?? 'N/A'}%</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openEditLevelModal(level); }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {vipLevels.length === 0 && !isLoadingLevels && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No VIP levels configured yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bonuses for Selected VIP Level Section */}
      {selectedLevel && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Bonuses for {selectedLevel.name} (Level {selectedLevel.level})</CardTitle>
                    <CardDescription>Manage bonuses specifically available for this VIP tier.</CardDescription>
                </div>
                {/* TODO: Implement Add Bonus functionality and modal */}
                <Button onClick={() => alert("Add bonus modal for " + selectedLevel.name)} disabled={isLoadingBonuses}>
                    {isLoadingBonuses && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Add Bonus
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBonuses ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary"/> <span className="ml-2">Loading bonuses...</span></div> : bonuses.length > 0 ? (
              <Table>
                 <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>{bonus.name}</TableCell>
                      <TableCell className="capitalize">{bonus.type.replace(/_/g, ' ')}</TableCell>
                      <TableCell>{bonus.description}</TableCell>
                      <TableCell className="capitalize">{bonus.status}</TableCell>
                      <TableCell>
                        {/* TODO: Implement Edit Bonus functionality */}
                        <Button variant="outline" size="sm" onClick={() => alert(`Edit bonus: ${bonus.name}`)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground text-center py-4">No bonuses configured for this VIP level.</p>}
          </CardContent>
        </Card>
      )}
      
      {isLevelModalOpen && (
        <VipLevelManager
          {...vipLevelManagerProps} // Spread common props
          level={editingLevel}      // Pass current editingLevel (null for add, object for edit)
        />
      )}

    </div>
  );
};

export default VipBonusManagement;
