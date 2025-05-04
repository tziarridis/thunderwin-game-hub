import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Update User interface to match the one in UserProfile.tsx
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  ipAddress?: string;
  balance: number;
  vipLevel: number;
  status: string;
  isVerified: boolean;
  isAdmin?: boolean;
  role?: string;
  lastLogin?: string;
  created_at?: string;
  updated_at?: string;
  joined: string;
  favoriteGames: string[];
}

export interface UserInfoFormProps {
  user: User;
  onSubmit?: (user: User) => Promise<void>;
}

const UserInfoForm = ({ user, onSubmit }: UserInfoFormProps) => {
  const [userData, setUserData] = useState<User>({...user});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  
  const handleChange = (field: keyof User, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(userData);
        toast({
          title: "Success",
          description: "User information has been updated.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update user information.",
          variant: "destructive",
        });
        console.error("Error updating user:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={userData.name || ''} 
            onChange={(e) => handleChange('name', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            value={userData.username} 
            onChange={(e) => handleChange('username', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={userData.email} 
            onChange={(e) => handleChange('email', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            value={userData.phone || ''} 
            onChange={(e) => handleChange('phone', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vipLevel">VIP Level</Label>
          <Select 
            value={userData.vipLevel.toString()} 
            onValueChange={(value) => handleChange('vipLevel', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select VIP Level" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={userData.status} 
            onValueChange={(value) => handleChange('status', value as "Active" | "Pending" | "Inactive")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="balance">Balance</Label>
          <Input 
            id="balance" 
            type="number" 
            step="0.01" 
            value={userData.balance} 
            onChange={(e) => handleChange('balance', parseFloat(e.target.value))} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="isVerified" className="flex items-center gap-2">
            <span>Is Verified</span>
            <Switch 
              id="isVerified" 
              checked={userData.isVerified} 
              onCheckedChange={(checked) => handleChange('isVerified', checked)} 
            />
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="isAdmin" className="flex items-center gap-2">
            <span>Is Admin</span>
            <Switch 
              id="isAdmin" 
              checked={userData.isAdmin} 
              onCheckedChange={(checked) => handleChange('isAdmin', checked)} 
            />
          </Label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default UserInfoForm;
