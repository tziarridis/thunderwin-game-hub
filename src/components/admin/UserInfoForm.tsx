
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserInfoFormProps {
  initialValues: User;
  onSubmit: (values: User) => void;
}

const UserInfoForm = ({ initialValues, onSubmit }: UserInfoFormProps) => {
  const [formData, setFormData] = useState<Partial<User>>({
    ...initialValues,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [userTags, setUserTags] = useState<string[]>(["Regular"]);
  
  const handleChange = (field: keyof User, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (formData.balance !== undefined && formData.balance < 0) {
      newErrors.balance = "Balance cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData as User);
  };
  
  const addTag = (tag: string) => {
    if (tag && !userTags.includes(tag)) {
      setUserTags([...userTags, tag]);
    }
  };
  
  const removeTag = (tag: string) => {
    setUserTags(userTags.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                value={formData.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                placeholder="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Status</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select 
                value={formData.role || 'user'} 
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Regular User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isVerified">KYC Verification</Label>
              <Switch 
                id="isVerified" 
                checked={formData.isVerified || false}
                onCheckedChange={(checked) => handleChange('isVerified', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vipLevel">VIP Level (0-10)</Label>
              <Select 
                value={String(formData.vipLevel || 0)} 
                onValueChange={(value) => handleChange('vipLevel', parseInt(value))}
              >
                <SelectTrigger id="vipLevel">
                  <SelectValue placeholder="Select VIP level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      Level {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Financial & Affiliate Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Financial Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ($)</Label>
              <Input 
                id="balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.balance || 0}
                onChange={(e) => handleChange('balance', parseFloat(e.target.value))}
                className={errors.balance ? "border-red-500" : ""}
              />
              {errors.balance && <p className="text-red-500 text-xs">{errors.balance}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="joined">Join Date</Label>
              <Input 
                id="joined"
                type="date"
                value={formData.joined ? new Date(formData.joined).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('joined', e.target.value)}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Affiliate Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Affiliate Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code</Label>
              <Input 
                id="referralCode"
                value={formData.referralCode || ''}
                onChange={(e) => handleChange('referralCode', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referredBy">Referred By</Label>
              <Input 
                id="referredBy"
                value={formData.referredBy || ''}
                onChange={(e) => handleChange('referredBy', e.target.value)}
                disabled
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Admin Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Admin Notes & Tags</h3>
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Internal Notes</Label>
              <Textarea 
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private notes about this user (only visible to admins)"
                className="h-32"
              />
            </div>
            
            <div className="space-y-2">
              <Label>User Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {userTags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 bg-slate-700 rounded-full px-3 py-1 text-sm">
                    {tag}
                    <button 
                      type="button" 
                      className="text-white/60 hover:text-white"
                      onClick={() => removeTag(tag)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add tag" 
                  id="newTag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const input = document.getElementById('newTag') as HTMLInputElement;
                    addTag(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
          Update User
        </Button>
      </div>
    </form>
  );
};

export default UserInfoForm;
