import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VipLevel, Bonus } from '@/types'; // Ensure VipLevel and Bonus are exported from types
import VipLevelManager from '@/components/admin/VipLevelManager'; // Assuming this component exists
import { toast } from 'sonner';
// Mock service, replace with actual service calls
const mockVipService = {
  getVipLevels: async (): Promise<VipLevel[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, level: 1, name: 'Bronze', min_points: 0, cashback_percentage: 1, bonus_percentage: 5, benefits_description: "Basic benefits" },
      { id: 2, level: 2, name: 'Silver', min_points: 1000, cashback_percentage: 2, bonus_percentage: 10, benefits_description: "Better benefits" },
      { id: 3, level: 3, name: 'Gold', min_points: 5000, cashback_percentage: 3, bonus_percentage: 15, benefits_description: "Premium benefits" },
    ]), 500));
  },
  updateVipLevel: async (level: VipLevel): Promise<VipLevel> => {
    console.log("Updating VIP Level:", level);
    toast.success(`VIP Level ${level.name} updated (mock).`);
    return level;
  },
  addVipLevel: async (levelData: Omit<VipLevel, 'id' | 'created_at' | 'updated_at'>): Promise<VipLevel> => {
    const newLevel = { ...levelData, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as VipLevel;
    console.log("Adding VIP Level:", newLevel);
    toast.success(`VIP Level ${newLevel.name} added (mock).`);
    return newLevel;
  }
};

const mockBonusService = {
  getBonusesForVipLevel: async (levelId: string | number): Promise<Bonus[]> => {
    console.log("Fetching bonuses for VIP level:", levelId)
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 1, name: 'Bronze Welcome Bonus', description: 'Get 50 free spins', type: 'free_spins', status: 'active', vip_level_required: 1 },
      { id: 2, name: 'Silver Reload Bonus', description: '10% reload up to $50', type: 'deposit', amount: 50, percentage: 10, status: 'active', vip_level_required: 2 },
    ].filter(b => b.vip_level_required === levelId || (typeof levelId === 'number' && b.vip_level_required === levelId))), 500));
  },
  // Add updateBonus, addBonus etc.
};


const VipBonusManagement = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [isLoadingBonuses, setIsLoadingBonuses] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<VipLevel | null>(null);


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
    setIsLoadingLevels(true);
    try {
      let savedLevel;
      if ('id' in levelData && levelData.id) {
        savedLevel = await mockVipService.updateVipLevel(levelData as VipLevel);
        setVipLevels(prev => prev.map(l => l.id === savedLevel.id ? savedLevel : l));
      } else {
        savedLevel = await mockVipService.addVipLevel(levelData as Omit<VipLevel, 'id' | 'created_at' | 'updated_at'>);
        setVipLevels(prev => [...prev, savedLevel]);
      }
      setIsLevelModalOpen(false);
      setEditingLevel(null);
    } catch (error) {
      toast.error("Failed to save VIP level.");
    } finally {
      setIsLoadingLevels(false);
    }
  };
  
  const openAddLevelModal = () => {
    setEditingLevel(null); // Clear any editing state
    setIsLevelModalOpen(true);
  };

  const openEditLevelModal = (level: VipLevel) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
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
            <Button onClick={openAddLevelModal} disabled={isLoadingLevels}>Add VIP Level</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLevels ? <p>Loading VIP levels...</p> : (
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
                    className={selectedLevel?.id === level.id ? "bg-muted/50 cursor-pointer" : "cursor-pointer hover:bg-muted/30"}
                  >
                    <TableCell>{level.level}</TableCell>
                    <TableCell>{level.name}</TableCell>
                    <TableCell>{level.min_points}</TableCell>
                    <TableCell>{level.cashback_percentage ?? 'N/A'}%</TableCell>
                    <TableCell>{level.bonus_percentage ?? 'N/A'}%</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openEditLevelModal(level); }}>Edit</Button>
                       {/* Add Delete button here if needed */}
                    </TableCell>
                  </TableRow>
                ))}
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
                <Button onClick={() => alert("Add bonus modal for " + selectedLevel.name)} disabled={isLoadingBonuses}>Add Bonus</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBonuses ? <p>Loading bonuses...</p> : bonuses.length > 0 ? (
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
                      <TableCell className="capitalize">{bonus.type.replace('_', ' ')}</TableCell>
                      <TableCell>{bonus.description}</TableCell>
                      <TableCell className="capitalize">{bonus.status}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => alert(`Edit bonus: ${bonus.name}`)}>Edit</Button>
                         {/* Add Delete button here */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p>No bonuses configured for this VIP level.</p>}
          </CardContent>
        </Card>
      )}
      
      {isLevelModalOpen && (
        <VipLevelManager
          level={editingLevel}
          onSave={handleSaveVipLevel}
          onClose={() => { setIsLevelModalOpen(false); setEditingLevel(null); }}
          isLoading={isLoadingLevels}
        />
      )}

    </div>
  );
};

export default VipBonusManagement;
