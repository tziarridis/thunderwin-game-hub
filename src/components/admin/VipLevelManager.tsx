
import { useState } from 'react';
import { VipLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface VipLevelManagerProps {
  levels: VipLevel[];
  onUpdate: (level: VipLevel) => Promise<void>;
  onCreate: (level: Omit<VipLevel, 'id'>) => Promise<void>;
}

const VipLevelManager = ({ levels, onUpdate, onCreate }: VipLevelManagerProps) => {
  const [editingLevel, setEditingLevel] = useState<VipLevel | null>(null);
  const [newLevel, setNewLevel] = useState<Omit<VipLevel, 'id'>>({
    level: levels.length + 1,
    name: '',
    pointsRequired: 0,
    requiredPoints: 0,
    benefits: [],
    cashbackRate: 0,
    withdrawalLimit: 0,
    bonuses: {
      depositMatch: 0,
      freeSpins: 0,
      birthdayBonus: 0
    },
    color: '#000000'
  });
  const { toast } = useToast();
  
  const handleEditChange = (field: string, value: any) => {
    if (!editingLevel) return;
    
    if (field === 'bonuses.depositMatch' || field === 'bonuses.freeSpins' || field === 'bonuses.birthdayBonus') {
      const [parent, child] = field.split('.');
      setEditingLevel({
        ...editingLevel,
        bonuses: {
          ...editingLevel.bonuses,
          [child]: value
        }
      });
    } else {
      setEditingLevel({
        ...editingLevel,
        [field]: value
      } as VipLevel);
    }
  };
  
  const handleNewChange = (field: string, value: any) => {
    if (field === 'bonuses.depositMatch' || field === 'bonuses.freeSpins' || field === 'bonuses.birthdayBonus') {
      const [parent, child] = field.split('.');
      setNewLevel({
        ...newLevel,
        bonuses: {
          ...newLevel.bonuses,
          [child]: value
        }
      });
    } else {
      setNewLevel({
        ...newLevel,
        [field]: value
      } as Omit<VipLevel, 'id'>);
    }
  };
  
  const handleUpdateLevel = async () => {
    if (!editingLevel) return;
    
    try {
      await onUpdate(editingLevel);
      toast({
        title: "Success",
        description: `VIP level "${editingLevel.name}" has been updated.`,
      });
      setEditingLevel(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update VIP level. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateLevel = async () => {
    try {
      await onCreate(newLevel);
      toast({
        title: "Success",
        description: `VIP level "${newLevel.name}" has been created.`,
      });
      setNewLevel({
        level: levels.length + 2,
        name: '',
        pointsRequired: 0,
        requiredPoints: 0,
        benefits: [],
        cashbackRate: 0,
        withdrawalLimit: 0,
        bonuses: {
          depositMatch: 0,
          freeSpins: 0,
          birthdayBonus: 0
        },
        color: '#000000'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create VIP level. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {levels.map((level) => (
          <Card key={level.id} className="overflow-hidden">
            <div 
              className="h-2"
              style={{ backgroundColor: level.color }}
            ></div>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{level.name}</span>
                <span>Level {level.level}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <span className="font-semibold">Points Required:</span> {level.pointsRequired}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Cashback Rate:</span> {level.cashbackRate}%
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Withdrawal Limit:</span> ${level.withdrawalLimit}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Bonuses:</span>
                  <ul className="list-disc list-inside pl-2">
                    <li>Deposit Match: {level.bonuses.depositMatch}%</li>
                    <li>Free Spins: {level.bonuses.freeSpins}</li>
                    <li>Birthday Bonus: ${level.bonuses.birthdayBonus}</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Benefits:</span>
                  <ul className="list-disc list-inside pl-2">
                    {level.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setEditingLevel(level)}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {editingLevel && (
        <Card>
          <CardHeader>
            <CardTitle>Edit VIP Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingLevel.name} 
                  onChange={(e) => handleEditChange('name', e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Input 
                  id="edit-level" 
                  type="number" 
                  value={editingLevel.level} 
                  onChange={(e) => handleEditChange('level', parseInt(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="edit-points">Points Required</Label>
                <Input 
                  id="edit-points" 
                  type="number" 
                  value={editingLevel.pointsRequired} 
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    handleEditChange('pointsRequired', value);
                    handleEditChange('requiredPoints', value);
                  }} 
                />
              </div>
              <div>
                <Label htmlFor="edit-cashback">Cashback Rate (%)</Label>
                <Input 
                  id="edit-cashback" 
                  type="number" 
                  step="0.5" 
                  value={editingLevel.cashbackRate} 
                  onChange={(e) => handleEditChange('cashbackRate', parseFloat(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="edit-withdrawal">Withdrawal Limit ($)</Label>
                <Input 
                  id="edit-withdrawal" 
                  type="number" 
                  value={editingLevel.withdrawalLimit} 
                  onChange={(e) => handleEditChange('withdrawalLimit', parseInt(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="edit-color" 
                    value={editingLevel.color} 
                    onChange={(e) => handleEditChange('color', e.target.value)} 
                  />
                  <div 
                    className="w-10 h-10 rounded" 
                    style={{ backgroundColor: editingLevel.color }}
                  ></div>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-deposit-match">Deposit Match (%)</Label>
                <Input 
                  id="edit-deposit-match" 
                  type="number" 
                  value={editingLevel.bonuses.depositMatch} 
                  onChange={(e) => handleEditChange('bonuses.depositMatch', parseInt(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="edit-free-spins">Free Spins</Label>
                <Input 
                  id="edit-free-spins" 
                  type="number" 
                  value={editingLevel.bonuses.freeSpins} 
                  onChange={(e) => handleEditChange('bonuses.freeSpins', parseInt(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="edit-birthday-bonus">Birthday Bonus ($)</Label>
                <Input 
                  id="edit-birthday-bonus" 
                  type="number" 
                  value={editingLevel.bonuses.birthdayBonus} 
                  onChange={(e) => handleEditChange('bonuses.birthdayBonus', parseInt(e.target.value))} 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-benefits">Benefits (comma separated)</Label>
                <Input 
                  id="edit-benefits" 
                  value={editingLevel.benefits.join(', ')} 
                  onChange={(e) => handleEditChange('benefits', e.target.value.split(',').map(b => b.trim()))} 
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={() => setEditingLevel(null)}>Cancel</Button>
              <Button onClick={handleUpdateLevel}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Add New VIP Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-name">Name</Label>
              <Input 
                id="new-name" 
                value={newLevel.name} 
                onChange={(e) => handleNewChange('name', e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="new-level">Level</Label>
              <Input 
                id="new-level" 
                type="number" 
                value={newLevel.level} 
                onChange={(e) => handleNewChange('level', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <Label htmlFor="new-points">Points Required</Label>
              <Input 
                id="new-points" 
                type="number" 
                value={newLevel.pointsRequired} 
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleNewChange('pointsRequired', value);
                  handleNewChange('requiredPoints', value);
                }} 
              />
            </div>
            <div>
              <Label htmlFor="new-cashback">Cashback Rate (%)</Label>
              <Input 
                id="new-cashback" 
                type="number" 
                step="0.5" 
                value={newLevel.cashbackRate} 
                onChange={(e) => handleNewChange('cashbackRate', parseFloat(e.target.value))} 
              />
            </div>
            <div>
              <Label htmlFor="new-withdrawal">Withdrawal Limit ($)</Label>
              <Input 
                id="new-withdrawal" 
                type="number" 
                value={newLevel.withdrawalLimit} 
                onChange={(e) => handleNewChange('withdrawalLimit', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <Label htmlFor="new-color">Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="new-color" 
                  value={newLevel.color} 
                  onChange={(e) => handleNewChange('color', e.target.value)} 
                />
                <div 
                  className="w-10 h-10 rounded" 
                  style={{ backgroundColor: newLevel.color }}
                ></div>
              </div>
            </div>
            <div>
              <Label htmlFor="new-deposit-match">Deposit Match (%)</Label>
              <Input 
                id="new-deposit-match" 
                type="number" 
                value={newLevel.bonuses.depositMatch} 
                onChange={(e) => handleNewChange('bonuses.depositMatch', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <Label htmlFor="new-free-spins">Free Spins</Label>
              <Input 
                id="new-free-spins" 
                type="number" 
                value={newLevel.bonuses.freeSpins} 
                onChange={(e) => handleNewChange('bonuses.freeSpins', parseInt(e.target.value))} 
              />
            </div>
            <div>
              <Label htmlFor="new-birthday-bonus">Birthday Bonus ($)</Label>
              <Input 
                id="new-birthday-bonus" 
                type="number" 
                value={newLevel.bonuses.birthdayBonus} 
                onChange={(e) => handleNewChange('bonuses.birthdayBonus', parseInt(e.target.value))} 
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-benefits">Benefits (comma separated)</Label>
              <Input 
                id="new-benefits" 
                value={newLevel.benefits.join(', ')} 
                onChange={(e) => handleNewChange('benefits', e.target.value.split(',').map(b => b.trim()))} 
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleCreateLevel}>Add VIP Level</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VipLevelManager;
