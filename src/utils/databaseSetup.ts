
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to set up the database schema
 * In a real production environment, this would be managed by migrations
 * This is a simplified version for demo purposes
 */
export const setupDatabase = async () => {
  try {
    console.log('Starting database setup check...');
    
    // Check if tables exist by making a simple query to each table
    const providersCheck = await supabase
      .from('providers')
      .select('id')
      .limit(1);
    
    const categoriesCheck = await supabase
      .from('game_categories')
      .select('id')
      .limit(1);

    const transactionsCheck = await supabase
      .from('transactions')
      .select('id')
      .limit(1);

    // Log table check results
    console.log('Tables check results:');
    console.log('Providers:', providersCheck.error ? 'Error' : 'OK');
    console.log('Categories:', categoriesCheck.error ? 'Error' : 'OK');
    console.log('Transactions:', transactionsCheck.error ? 'Error' : 'OK');

    // Check if we need to seed data
    let needToSeedData = false;
    
    if (!providersCheck.error) {
      const { count: providersCount } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true });
        
      if (providersCount === 0) {
        console.log('Providers table is empty, will seed data');
        needToSeedData = true;
      }
    }
    
    if (!categoriesCheck.error) {
      const { count: categoriesCount } = await supabase
        .from('game_categories')
        .select('*', { count: 'exact', head: true });
        
      if (categoriesCount === 0) {
        console.log('Categories table is empty, will seed data');
        needToSeedData = true;
      }
    }

    if (needToSeedData) {
      await seedTestData();
    } else {
      console.log('Database already has data, skipping seeding');
    }

    console.log('Database setup check completed');
    return true;
  } catch (error) {
    console.error('Error checking database setup:', error);
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
    } else {
      console.log('Providers data seeded successfully');
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
    } else {
      console.log('Categories data seeded successfully');
    }

    // Seed some example transactions
    const sampleTransactions = [
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'deposit',
        amount: 100,
        currency: 'USD',
        status: 'completed'
      },
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'bet',
        amount: 10,
        currency: 'USD',
        game_id: 'sweet-bonanza',
        status: 'completed'
      },
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'win',
        amount: 25,
        currency: 'USD',
        game_id: 'sweet-bonanza',
        status: 'completed'
      },
      {
        player_id: 'user456',
        provider: 'Evolution Gaming',
        type: 'deposit',
        amount: 200,
        currency: 'USD',
        status: 'completed'
      },
      {
        player_id: 'user456',
        provider: 'NetEnt',
        type: 'bet',
        amount: 15,
        currency: 'USD',
        game_id: 'starburst',
        status: 'completed'
      },
      {
        player_id: 'user789',
        provider: 'Microgaming',
        type: 'win',
        amount: 150,
        currency: 'USD',
        game_id: 'immortal-romance',
        status: 'completed'
      }
    ];

    // Only seed transactions if the table is empty
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      const { error: transactionsError } = await supabase
        .from('transactions')
        .insert(sampleTransactions);

      if (transactionsError) {
        console.error('Error seeding transactions:', transactionsError);
      } else {
        console.log('Transactions data seeded successfully');
      }
    } else {
      console.log('Transactions table already has data, skipping seeding');
    }
    
    console.log('Test data seeding completed');
    return true;
  } catch (error) {
    console.error('Error seeding test data:', error);
    return false;
  }
};
