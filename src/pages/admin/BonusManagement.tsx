
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BonusType } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, Plus, RefreshCw, Trash2, Gift, Tag, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { bonusService } from '@/services/bonusService';

const BonusManagement = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeBonuses, setActiveBonuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);
  
  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: BonusType.WELCOME,
    value: 100,
    minDeposit: 20,
    wageringRequirement: 35,
    durationDays: 7,
    vipLevels: [],
    isActive: true,
    bonusType: 'percentage',
    percentage: 100,
    maxBonus: 100,
    vipLevelRequired: 0,
    allowedGames: 'all',
    code: ''
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const templatesData = await bonusService.getBonusTemplates();
      setTemplates(templatesData);
      
      // In a real scenario, we would get all active bonuses
      // For this example, we'll use mock data
      setActiveBonuses([
        {
          id: '1',
          userId: 'user-123',
          username: 'player1',
          type: BonusType.WELCOME,
          amount: 100,
          status: 'active',
          expiryDate: '2025-05-15T00:00:00Z',
          createdAt: '2025-05-01T14:30:00Z',
          wageringRequirement: 35,
          progress: 45,
          description: '100% Welcome Bonus up to $100'
        },
        {
          id: '2',
          userId: 'user-456',
          username: 'player2',
          type: BonusType.DEPOSIT,
          amount: 50,
          status: 'active',
          expiryDate: '2025-05-10T00:00:00Z',
          createdAt: '2025-04-25T09:45:00Z',
          wageringRequirement: 30,
          progress: 60,
          description: '50% Reload Bonus up to $50'
        },
        {
          id: '3',
          userId: 'user-789',
          username: 'player3',
          type: BonusType.FREE_SPINS,
          amount: 20,
          status: 'active',
          expiryDate: '2025-05-08T00:00:00Z',
          createdAt: '2025-04-28T16:15:00Z',
          wageringRequirement: 20,
          progress: 10,
          description: '20 Free Spins on Starburst'
        }
      ]);
    } catch (error) {
      console.error('Error loading bonus data:', error);
      toast.error('Error loading bonus data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await bonusService.createBonusTemplate(newTemplate);
      if (result) {
        setTemplates([...templates, result]);
        setIsNewTemplateDialogOpen(false);
        toast.success('Bonus template created successfully');
        
        // Reset form
        setNewTemplate({
          name: '',
          description: '',
          type: BonusType.WELCOME,
          value: 100,
          minDeposit: 20,
          wageringRequirement: 35,
          durationDays: 7,
          vipLevels: [],
          isActive: true,
          bonusType: 'percentage',
          percentage: 100,
          maxBonus: 100,
          vipLevelRequired: 0,
          allowedGames: 'all',
          code: ''
        });
      }
    } catch (error) {
      console.error('Error creating bonus template:', error);
      toast.error('Error creating bonus template');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'minDeposit' || name === 'wageringRequirement' || 
              name === 'durationDays' || name === 'percentage' || name === 'maxBonus' || 
              name === 'vipLevelRequired' 
                ? parseFloat(value) 
                : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const cancelBonus = async (bonusId: string) => {
    try {
      const success = await bonusService.updateBonusStatus(bonusId, 'cancelled');
      if (success) {
        setActiveBonuses(activeBonuses.filter(bonus => bonus.id !== bonusId));
        toast.success('Bonus cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling bonus:', error);
      toast.error('Error cancelling bonus');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getBonusTypeLabel = (type: BonusType) => {
    switch (type) {
      case BonusType.WELCOME:
        return 'Welcome Bonus';
      case BonusType.DEPOSIT:
        return 'Deposit Bonus';
      case BonusType.RELOAD:
        return 'Reload Bonus';
      case BonusType.CASHBACK:
        return 'Cashback';
      case BonusType.FREE_SPINS:
        return 'Free Spins';
      case BonusType.VIP:
        return 'VIP Bonus';
      case BonusType.REFERRAL:
        return 'Referral Bonus';
      default:
        return 'Bonus';
    }
  };
  
  const getBonusTypeColor = (type: BonusType) => {
    switch (type) {
      case BonusType.WELCOME:
        return 'bg-green-500';
      case BonusType.DEPOSIT:
        return 'bg-blue-500';
      case BonusType.RELOAD:
        return 'bg-purple-500';
      case BonusType.CASHBACK:
        return 'bg-amber-500';
      case BonusType.FREE_SPINS:
        return 'bg-pink-500';
      case BonusType.VIP:
        return 'bg-indigo-500';
      case BonusType.REFERRAL:
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bonus Management</h1>
          <p className="text-muted-foreground">Manage casino bonuses and promotional offers</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="templates">
            <Gift className="w-4 h-4 mr-2" />
            Bonus Templates
          </TabsTrigger>
          <TabsTrigger value="active">
            <Tag className="w-4 h-4 mr-2" />
            Active Bonuses
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <div className="flex justify-end mb-6">
            <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Bonus Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleNewTemplateSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Bonus Template</DialogTitle>
                    <DialogDescription>
                      Create a new bonus template to be used for player bonuses
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Bonus Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={newTemplate.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Welcome Bonus"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        value={newTemplate.description}
                        onChange={handleInputChange}
                        placeholder="Detailed bonus description for players"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Bonus Type</Label>
                      <Select 
                        value={newTemplate.type} 
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BonusType.WELCOME}>Welcome Bonus</SelectItem>
                          <SelectItem value={BonusType.DEPOSIT}>Deposit Bonus</SelectItem>
                          <SelectItem value={BonusType.RELOAD}>Reload Bonus</SelectItem>
                          <SelectItem value={BonusType.CASHBACK}>Cashback</SelectItem>
                          <SelectItem value={BonusType.FREE_SPINS}>Free Spins</SelectItem>
                          <SelectItem value={BonusType.VIP}>VIP Bonus</SelectItem>
                          <SelectItem value={BonusType.REFERRAL}>Referral Bonus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bonusType">Bonus Value Type</Label>
                      <Select 
                        value={newTemplate.bonusType} 
                        onValueChange={(value) => handleSelectChange('bonusType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select value type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage of Deposit</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="freespins">Free Spins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newTemplate.bonusType === 'percentage' ? (
                      <>
                        <div>
                          <Label htmlFor="percentage">Percentage (%)</Label>
                          <Input 
                            id="percentage" 
                            name="percentage"
                            type="number"
                            value={newTemplate.percentage}
                            onChange={handleInputChange}
                            min="1"
                            max="300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxBonus">Maximum Bonus Amount ($)</Label>
                          <Input 
                            id="maxBonus" 
                            name="maxBonus"
                            type="number"
                            value={newTemplate.maxBonus}
                            onChange={handleInputChange}
                            min="1"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label htmlFor="value">
                          {newTemplate.bonusType === 'freespins' ? 'Number of Free Spins' : 'Bonus Amount ($)'}
                        </Label>
                        <Input 
                          id="value" 
                          name="value"
                          type="number"
                          value={newTemplate.value}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="minDeposit">Minimum Deposit ($)</Label>
                      <Input 
                        id="minDeposit" 
                        name="minDeposit"
                        type="number"
                        value={newTemplate.minDeposit}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label>
                      <Input 
                        id="wageringRequirement" 
                        name="wageringRequirement"
                        type="number"
                        value={newTemplate.wageringRequirement}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="durationDays">Duration (Days)</Label>
                      <Input 
                        id="durationDays" 
                        name="durationDays"
                        type="number"
                        value={newTemplate.durationDays}
                        onChange={handleInputChange}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="code">Bonus Code (Optional)</Label>
                      <Input 
                        id="code" 
                        name="code"
                        value={newTemplate.code}
                        onChange={handleInputChange}
                        placeholder="e.g. WELCOME100"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="vipLevelRequired">Minimum VIP Level</Label>
                      <Input 
                        id="vipLevelRequired" 
                        name="vipLevelRequired"
                        type="number"
                        value={newTemplate.vipLevelRequired}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="allowedGames">Allowed Games</Label>
                      <Input 
                        id="allowedGames" 
                        name="allowedGames"
                        value={newTemplate.allowedGames}
                        onChange={handleInputChange}
                        placeholder="e.g. all, slots, table games"
                        required
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Template</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <Card key={template.id}>
                    <div className={`h-2 ${getBonusTypeColor(template.type)}`}></div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{template.name}</span>
                        {template.isActive && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{getBonusTypeLabel(template.type)}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Value:</span>
                            <span>
                              {template.bonusType === 'percentage' 
                                ? `${template.percentage}% up to $${template.maxBonus}` 
                                : template.bonusType === 'freespins'
                                  ? `${template.value} Free Spins`
                                  : `$${template.value}`
                              }
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min. Deposit:</span>
                            <span>${template.minDeposit}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wagering:</span>
                            <span>{template.wageringRequirement}x</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Duration:</span>
                            <span>{template.durationDays} days</span>
                          </div>
                          
                          {template.code && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Code:</span>
                              <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
                                {template.code}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min. VIP Level:</span>
                            <span>{template.vipLevelRequired}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-8 text-center border rounded-lg border-dashed">
                  <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Bonus Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first bonus template to offer promotions to your players
                  </p>
                  <Button onClick={() => setIsNewTemplateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Player Bonuses</CardTitle>
              <CardDescription>Currently active bonuses assigned to players</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBonuses.length > 0 ? (
                      activeBonuses.map((bonus) => (
                        <TableRow key={bonus.id}>
                          <TableCell className="font-medium">{bonus.username}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getBonusTypeColor(bonus.type)}`} />
                              <span>{getBonusTypeLabel(bonus.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>${bonus.amount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-full rounded-full" 
                                  style={{ width: `${bonus.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{bonus.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDate(bonus.expiryDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Check className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelBonus(bonus.id)}>
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">No active bonuses found</div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bonus System Settings</CardTitle>
              <CardDescription>Configure global bonus system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Global Wagering Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="default-wagering">Default Wagering Requirement</Label>
                      <Input id="default-wagering" type="number" defaultValue={35} min={0} />
                    </div>
                    <div>
                      <Label htmlFor="max-bonus">Maximum Bonus Amount</Label>
                      <Input id="max-bonus" type="number" defaultValue={1000} min={0} />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Game Contribution Percentages</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slots-contribution">Slots</Label>
                      <Input id="slots-contribution" type="number" defaultValue={100} min={0} max={100} />
                      <p className="text-xs text-muted-foreground mt-1">% of wager that contributes to wagering requirements</p>
                    </div>
                    <div>
                      <Label htmlFor="table-contribution">Table Games</Label>
                      <Input id="table-contribution" type="number" defaultValue={10} min={0} max={100} />
                      <p className="text-xs text-muted-foreground mt-1">% of wager that contributes to wagering requirements</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Bonus Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-active-bonuses">Maximum Active Bonuses Per User</Label>
                      <Input id="max-active-bonuses" type="number" defaultValue={3} min={1} />
                    </div>
                    <div>
                      <Label htmlFor="max-daily">Maximum Daily Bonus Amount</Label>
                      <Input id="max-daily" type="number" defaultValue={200} min={0} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonusManagement;
