
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Game, GameProvider, GameCategory, GameStatus, GameVolatility } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save, Image as ImageIcon, Tags, DollarSign, BarChart, CalendarDays, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const GameManagementPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>(); // gameId can be actual ID or slug
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewGame = gameId === 'new';

  const [gameData, setGameData] = useState<Partial<Game>>({
    title: '',
    slug: '',
    game_id: '', // External Game ID
    provider_slug: '',
    category_slugs: [],
    status: 'pending',
    is_featured: false,
    isNew: true, // Default to new for new games
    tags: [],
  });

  // Fetch game data if editing
  const { data: existingGame, isLoading: isLoadingGame } = useQuery<Game | null, Error>(
    ['admin_single_game', gameId],
    async () => {
      if (isNewGame || !gameId) return null;
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .or(`id.eq.${gameId},slug.eq.${gameId},game_id.eq.${gameId}`) // Try matching by id, slug or game_id
        .maybeSingle();
      if (error) throw error;
      return data as Game | null;
    },
    { enabled: !isNewGame && !!gameId }
  );

  useEffect(() => {
    if (existingGame) {
      setGameData({
        ...existingGame,
        tags: Array.isArray(existingGame.tags) ? existingGame.tags : (typeof existingGame.tags === 'string' ? existingGame.tags.split(',').map(t => t.trim()) : [])
      });
    }
  }, [existingGame]);

  // Fetch providers and categories for dropdowns
  const { data: providers = [] } = useQuery<GameProvider[], Error>(['admin_game_providers_form'], async () => {
    const { data, error } = await supabase.from('providers').select('id, name, slug');
    if (error) throw error;
    return data.map(p => ({...p, slug: p.slug || String(p.id) })) as GameProvider[];
  });

  const { data: categories = [] } = useQuery<GameCategory[], Error>(['admin_game_categories_form'], async () => {
    const { data, error } = await supabase.from('game_categories').select('id, name, slug');
    if (error) throw error;
    return data as GameCategory[];
  });

  const mutation = useMutation<Game, Error, Partial<Game>>(
    async (payload) => {
      // Prepare payload
      const upsertData = {
        ...payload,
        rtp: payload.rtp ? parseFloat(String(payload.rtp)) : undefined,
        lines: payload.lines ? parseInt(String(payload.lines)) : undefined,
        min_bet: payload.min_bet ? parseFloat(String(payload.min_bet)) : undefined,
        max_bet: payload.max_bet ? parseFloat(String(payload.max_bet)) : undefined,
        tags: Array.isArray(payload.tags) ? payload.tags : (typeof payload.tags === 'string' ? payload.tags.split(',').map(t=>t.trim()) : []),
      };

      // If it's a new game and an 'id' field is auto-generated, remove it from payload
      // Or ensure 'game_id' is the primary key for upsert if 'id' is not used on this table
      if (isNewGame && upsertData.id && !upsertData.game_id) {
         // If 'id' is not the main identifier and 'game_id' is, ensure 'game_id' is set.
         // If 'id' is an auto-increment PK, it shouldn't be in the payload for insert.
         // For simplicity, if upserting on 'game_id' or 'slug', 'id' might be ignored or handled by db.
      }


      const { data, error } = await supabase
        .from('games')
        .upsert(upsertData as any, { onConflict: 'game_id' }) // Assuming game_id is unique constraint for upsert
        .select()
        .single();
      
      if (error) throw error;
      return data as Game;
    },
    {
      onSuccess: (data) => {
        toast.success(`Game ${isNewGame ? 'created' : 'updated'} successfully!`);
        queryClient.invalidateQueries(['admin_games']); // Invalidate list
        queryClient.invalidateQueries(['admin_single_game', gameId]); // Invalidate this game's cache
        if (isNewGame && data.id) {
          navigate(`/admin/games/manage/${data.slug || data.id}`); // Navigate to edit page of new game
        }
      },
      onError: (error) => {
        toast.error(`Failed to save game: ${error.message}`);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameData.title || !gameData.slug || !gameData.game_id || !gameData.provider_slug) {
        toast.error("Please fill in all required fields: Title, Slug, Game ID, and Provider.");
        return;
    }
    mutation.mutate(gameData);
  };

  const handleInputChange = (field: keyof Game, value: any) => {
    setGameData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof Game, checked: boolean) => {
    setGameData(prev => ({ ...prev, [field]: checked }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setGameData(prev => ({ ...prev, tags: tagsArray }));
  };

  if (isLoadingGame && !isNewGame) return <p className="text-center py-10">Loading game data...</p>;

  const gameStatuses: GameStatus[] = ["active", "inactive", "pending", "blocked"];
  const volatilities: GameVolatility[] = ["low", "low-medium", "medium", "medium-high", "high"];

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => navigate('/admin/games')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games List
      </Button>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary" /> Basic Information</CardTitle>
            <CardDescription>Core details identifying the game.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div><Label htmlFor="title">Title*</Label><Input id="title" value={gameData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} required /></div>
            <div><Label htmlFor="slug">Slug*</Label><Input id="slug" value={gameData.slug || ''} onChange={(e) => handleInputChange('slug', e.target.value)} required /></div>
            <div><Label htmlFor="game_id">External Game ID*</Label><Input id="game_id" value={gameData.game_id || ''} onChange={(e) => handleInputChange('game_id', e.target.value)} required /></div>
            <div>
              <Label htmlFor="provider_slug">Provider*</Label>
              <Select value={gameData.provider_slug || ''} onValueChange={(val) => handleInputChange('provider_slug', val)} required>
                <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                <SelectContent>{providers.map(p => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category_slugs">Category Slugs (comma-separated)</Label>
              <Input id="category_slugs" value={(gameData.category_slugs || []).join(',')} onChange={(e) => handleInputChange('category_slugs', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={gameData.status || 'pending'} onValueChange={(val) => handleInputChange('status', val as GameStatus)}>
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>{gameStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Visuals & Description</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="cover">Cover Image URL</Label><Input id="cover" value={gameData.cover || ''} onChange={(e) => handleInputChange('cover', e.target.value)} /></div>
              <div><Label htmlFor="banner">Banner Image URL</Label><Input id="banner" value={gameData.banner || ''} onChange={(e) => handleInputChange('banner', e.target.value)} /></div>
              <div><Label htmlFor="description">Description</Label><Textarea id="description" value={gameData.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={4} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary" /> Gameplay Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="rtp">RTP (%)</Label><Input id="rtp" type="number" step="0.01" value={gameData.rtp || ''} onChange={(e) => handleInputChange('rtp', e.target.value)} /></div>
              <div>
                <Label htmlFor="volatility">Volatility</Label>
                <Select value={gameData.volatility || ''} onValueChange={(val) => handleInputChange('volatility', val as GameVolatility | undefined)}>
                  <SelectTrigger><SelectValue placeholder="Select Volatility" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">N/A</SelectItem>
                    {volatilities.map(v => <SelectItem key={v} value={v}>{v.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="lines">Lines</Label><Input id="lines" type="number" value={gameData.lines || ''} onChange={(e) => handleInputChange('lines', e.target.value)} /></div>
              <div><Label htmlFor="min_bet">Min Bet</Label><Input id="min_bet" type="number" step="0.01" value={gameData.min_bet || ''} onChange={(e) => handleInputChange('min_bet', e.target.value)} /></div>
              <div><Label htmlFor="max_bet">Max Bet</Label><Input id="max_bet" type="number" step="0.01" value={gameData.max_bet || ''} onChange={(e) => handleInputChange('max_bet', e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center"><Tags className="mr-2 h-5 w-5 text-primary" /> Tags & Flags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={Array.isArray(gameData.tags) ? gameData.tags.join(',') : (gameData.tags || '')} onChange={handleTagsChange} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center space-x-2"><Checkbox id="is_featured" checked={!!gameData.is_featured} onCheckedChange={(c) => handleCheckboxChange('is_featured', !!c)} /><Label htmlFor="is_featured">Featured</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="isNew" checked={!!gameData.isNew} onCheckedChange={(c) => handleCheckboxChange('isNew', !!c)} /><Label htmlFor="isNew">New Game</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="only_real" checked={!!gameData.only_real} onCheckedChange={(c) => handleCheckboxChange('only_real', !!c)} /><Label htmlFor="only_real">Real Play Only</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="only_demo" checked={!!gameData.only_demo} onCheckedChange={(c) => handleCheckboxChange('only_demo', !!c)} /><Label htmlFor="only_demo">Demo Play Only</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="has_freespins" checked={!!gameData.has_freespins} onCheckedChange={(c) => handleCheckboxChange('has_freespins', !!c)} /><Label htmlFor="has_freespins">Has Freespins</Label></div>
            </div>
             <div><Label htmlFor="releaseDate">Release Date</Label><Input id="releaseDate" type="date" value={gameData.releaseDate ? String(gameData.releaseDate).substring(0,10) : ''} onChange={(e) => handleInputChange('releaseDate', e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/games')}>Cancel</Button>
          <Button type="submit" disabled={mutation.isLoading}>
            <Save className="mr-2 h-4 w-4" /> {mutation.isLoading ? 'Saving...' : 'Save Game'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GameManagementPage;
