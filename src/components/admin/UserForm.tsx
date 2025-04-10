
import { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
  initialValues?: User;
  onSubmit: (values: User | Omit<User, 'id'>) => void;
}

const UserForm = ({ initialValues, onSubmit }: UserFormProps) => {
  const [formData, setFormData] = useState<any>({
    name: initialValues?.name || "",
    email: initialValues?.email || "",
    status: initialValues?.status || "Active",
    balance: initialValues?.balance || 0,
    joined: initialValues?.joined || new Date().toISOString().split('T')[0],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
      email: formData.email,
      status: formData.status as User['status'],
      balance: parseFloat(formData.balance),
      joined: formData.joined,
      favoriteGames: initialValues?.favoriteGames || []
    };
    
    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="joined">Join Date</Label>
        <Input 
          id="joined"
          type="date"
          value={formData.joined}
          onChange={(e) => handleChange('joined', e.target.value)}
        />
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
