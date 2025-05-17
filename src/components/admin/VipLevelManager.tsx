import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { VipLevel } from '@/types'; // Ensure VipLevel is defined and imported

const VipLevelManager = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([
    { level: 1, name: 'Bronze', pointsRequired: 0, benefits: ['Basic Support'] },
    { level: 2, name: 'Silver', pointsRequired: 1000, benefits: ['Priority Support', 'Exclusive Bonuses'] },
    { level: 3, name: 'Gold', pointsRequired: 5000, benefits: ['Dedicated Account Manager', 'Higher Withdrawal Limits'] },
  ]);
  const [newLevel, setNewLevel] = useState<Partial<VipLevel>>({});
  const [editingLevel, setEditingLevel] = useState<number | null>(null);

  useEffect(() => {
    // Load VIP levels from local storage or API
    const storedLevels = localStorage.getItem('vipLevels');
    if (storedLevels) {
      setVipLevels(JSON.parse(storedLevels));
    }
  }, []);

  useEffect(() => {
    // Save VIP levels to local storage or API
    localStorage.setItem('vipLevels', JSON.stringify(vipLevels));
  }, [vipLevels]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setNewLevel({ ...newLevel, [field]: e.target.value });
  };

  const addVipLevel = () => {
    if (!newLevel.name || !newLevel.pointsRequired) {
      alert('Please fill in all fields');
      return;
    }

    const newVipLevel: VipLevel = {
      level: vipLevels.length + 1,
      name: newLevel.name as string,
      pointsRequired: parseInt(newLevel.pointsRequired as string),
      benefits: (newLevel.benefits as string)?.split(',').map(b => b.trim()) || [],
    };

    setVipLevels([...vipLevels, newVipLevel]);
    setNewLevel({});
  };

  const startEditing = (level: number) => {
    setEditingLevel(level);
    const levelToEdit = vipLevels.find(vl => vl.level === level);
    if (levelToEdit) {
      setNewLevel({ ...levelToEdit });
    }
  };

  const cancelEditing = () => {
    setEditingLevel(null);
    setNewLevel({});
  };

  const saveVipLevel = () => {
    if (!newLevel.name || !newLevel.pointsRequired || !editingLevel) {
      alert('Please fill in all fields');
      return;
    }

    const updatedVipLevel: VipLevel = {
      level: editingLevel,
      name: newLevel.name as string,
      pointsRequired: parseInt(newLevel.pointsRequired as string),
      benefits: (newLevel.benefits as string)?.split(',').map(b => b.trim()) || [],
    };

    const updatedLevels = vipLevels.map(vl =>
      vl.level === editingLevel ? updatedVipLevel : vl
    );

    setVipLevels(updatedLevels);
    setEditingLevel(null);
    setNewLevel({});
  };

  const deleteVipLevel = (level: number) => {
    if (window.confirm('Are you sure you want to delete this VIP level?')) {
      const updatedLevels = vipLevels.filter(vl => vl.level !== level);
      setVipLevels(updatedLevels);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">VIP Level Management</h2>

      <Table>
        <TableCaption>A list of your VIP levels.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Level</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Points Required</TableHead>
            <TableHead>Benefits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vipLevels.map((level) => (
            <TableRow key={level.level}>
              <TableCell className="font-medium">{level.level}</TableCell>
              <TableCell>{level.name}</TableCell>
              <TableCell>{level.pointsRequired}</TableCell>
              <TableCell>{level.benefits.join(', ')}</TableCell>
              <TableCell className="text-right">
                {editingLevel === level.level ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={saveVipLevel}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={() => startEditing(level.level)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteVipLevel(level.level)}>Delete</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h3 className="text-xl font-semibold mt-6">
        {editingLevel ? 'Edit VIP Level' : 'Add New VIP Level'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={(newLevel.name || '') as string}
            onChange={(e) => handleInputChange(e, 'name')}
          />
        </div>
        <div>
          <Label htmlFor="pointsRequired">Points Required</Label>
          <Input
            type="number"
            id="pointsRequired"
            value={(newLevel.pointsRequired || '') as string}
            onChange={(e) => handleInputChange(e, 'pointsRequired')}
          />
        </div>
        <div>
          <Label htmlFor="benefits">Benefits (comma-separated)</Label>
          <Input
            type="text"
            id="benefits"
            value={(newLevel.benefits || '') as string}
            onChange={(e) => handleInputChange(e, 'benefits')}
          />
        </div>
      </div>
      <div className="mt-4">
        {editingLevel ? (
          <>
            <Button onClick={saveVipLevel}>Save Changes</Button>
            <Button variant="ghost" onClick={cancelEditing}>Cancel Edit</Button>
          </>
        ) : (
          <Button onClick={addVipLevel}>Add VIP Level</Button>
        )}
      </div>
    </div>
  );
};

export default VipLevelManager;
