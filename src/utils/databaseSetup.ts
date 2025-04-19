
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to set up the database schema
 * In a real production environment, this would be managed by migrations
 * This is a simplified version for demo purposes
 */
export const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');
    
    // Check if tables exist
    const { error: providersError } = await supabase
      .from('providers')
      .select('count')
      .single();
    
    const { error: categoriesError } = await supabase
      .from('game_categories')
      .select('count')
      .single();

    if (providersError || categoriesError) {
      console.error('Error checking tables:', providersError || categoriesError);
      return false;
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

// Initialize test data for development
export const seedTestData = async () => {
  try {
    console.log('Seeding test data...');
    
    // Example: Insert providers data
    const providersData = [
      { name: 'Pragmatic Play', logo: '/providers/pragmatic.png', status: 'active' },
      { name: 'Evolution Gaming', logo: '/providers/evolution.png', status: 'active' },
      { name: 'NetEnt', logo: '/providers/netent.png', status: 'active' },
      { name: 'Microgaming', logo: '/providers/microgaming.png', status: 'active' },
      { name: 'Play\'n GO', logo: '/providers/playngo.png', status: 'active' }
    ];
    
    const { error: providersError } = await supabase
      .from('providers')
      .upsert(providersData, { onConflict: 'name' });

    if (providersError) {
      console.error('Error seeding providers:', providersError);
      return false;
    }
    
    // Example: Insert game categories data
    const categoriesData = [
      { name: 'Slots', slug: 'slots', status: 'active', show_home: true },
      { name: 'Table Games', slug: 'table-games', status: 'active', show_home: true },
      { name: 'Live Casino', slug: 'live-casino', status: 'active', show_home: true },
      { name: 'Jackpot Games', slug: 'jackpot-games', status: 'active', show_home: true },
      { name: 'Video Poker', slug: 'video-poker', status: 'active', show_home: false }
    ];
    
    const { error: categoriesError } = await supabase
      .from('game_categories')
      .upsert(categoriesData, { onConflict: 'slug' });

    if (categoriesError) {
      console.error('Error seeding categories:', categoriesError);
      return false;
    }
    
    console.log('Test data seeding completed');
    return true;
  } catch (error) {
    console.error('Error seeding test data:', error);
    return false;
  }
};

