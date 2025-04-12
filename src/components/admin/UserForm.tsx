
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface UserFormProps {
  initialValues?: User;
  onSubmit: (values: User | Omit<User, 'id'>) => void;
}

const UserForm = ({ initialValues, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<any>({
    name: initialValues?.name || "",
    username: initialValues?.username || "",
    email: initialValues?.email || "",
    status: initialValues?.status || "Active",
    balance: initialValues?.balance || 0,
    joined: initialValues?.joined || new Date().toISOString().split('T')[0],
    role: initialValues?.role || "user",
    vipLevel: initialValues?.vipLevel || 0,
    isVerified: initialValues?.isVerified || false,
    avatar: initialValues?.avatar || "/placeholder.svg"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const handleChange = (field: string, value: any) => {
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
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (formData.balance < 0) {
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
    
    // Format data for submission
    const userData = {
      ...(initialValues?.id ? { id: initialValues.id } : {}),
      name: formData.name,
      username: formData.username,
      email: formData.email,
      status: formData.status as User['status'],
      balance: parseFloat(formData.balance),
      joined: formData.joined,
      favoriteGames: initialValues?.favoriteGames || [],
      role: formData.role,
      vipLevel: parseInt(formData.vipLevel.toString()),
      isVerified: formData.isVerified,
      avatar: formData.avatar
    };
    
    // If this is an update to an existing user, also update the auth system if applicable
    if (initialValues?.id) {
      // Check if we need to update the current auth user
      const currentUser = JSON.parse(localStorage.getItem("thunderwin_user") || "null");
      if (currentUser && currentUser.id === initialValues.id) {
        currentUser.balance = parseFloat(formData.balance);
        currentUser.name = formData.name;
        currentUser.username = formData.username;
        currentUser.vipLevel = parseInt(formData.vipLevel.toString());
        currentUser.isVerified = formData.isVerified;
        localStorage.setItem("thunderwin_user", JSON.stringify(currentUser));
        
        toast({
          title: "Current User Updated",
          description: "The logged in user has been updated with the new information."
        });
      }
      
      // Also update the mock users array for future logins
      try {
        const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
        const userIndex = mockUsers.findIndex((u: any) => u.id === initialValues.id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            balance: parseFloat(formData.balance),
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role: formData.role,
            vipLevel: parseInt(formData.vipLevel.toString()),
            isVerified: formData.isVerified,
            avatar: formData.avatar
          };
          localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
        }
      } catch (error) {
        console.error("Failed to update mock users:", error);
      }
    }
    
    onSubmit(userData as User);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username"
            value={formData.username}
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
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={formData.role} 
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
        
        <div className="space-y-2">
          <Label htmlFor="balance">Balance ($)</Label>
          <Input 
            id="balance"
            type="number"
            min="0"
            step="0.01"
            value={formData.balance}
            onChange={(e) => handleChange('balance', e.target.value)}
            className={errors.balance ? "border-red-500" : ""}
          />
          {errors.balance && <p className="text-red-500 text-xs">{errors.balance}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="joined">Join Date</Label>
          <Input 
            id="joined"
            type="date"
            value={formData.joined}
            onChange={(e) => handleChange('joined', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vipLevel">VIP Level (0-10)</Label>
          <Input 
            id="vipLevel"
            type="number"
            min="0"
            max="10"
            value={formData.vipLevel}
            onChange={(e) => handleChange('vipLevel', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="isVerified">Verified Status</Label>
          <Select 
            value={formData.isVerified.toString()} 
            onValueChange={(value) => handleChange('isVerified', value === "true")}
          >
            <SelectTrigger id="isVerified">
              <SelectValue placeholder="Select verification status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Not Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
          {initialValues ? "Update User" : "Add User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
