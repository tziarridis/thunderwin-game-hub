
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
    
    const transactionsCheck = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
      
    const walletsCheck = await supabase
      .from('wallets')
      .select('id')
      .limit(1);

    // Log table check results
    console.log('Tables check results:');
    console.log('Providers:', providersCheck.error ? 'Error' : 'OK');
    console.log('Transactions:', transactionsCheck.error ? 'Error' : 'OK');
    console.log('Wallets:', walletsCheck.error ? 'Error' : 'OK');

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
    
    if (!transactionsCheck.error) {
      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
        
      if (transactionsCount === 0) {
        console.log('Transactions table is empty, will seed data');
        needToSeedData = true;
      }
    }
    
    if (!walletsCheck.error) {
      const { count: walletsCount } = await supabase
        .from('wallets')
        .select('*', { count: 'exact', head: true });
        
      if (walletsCount === 0) {
        console.log('Wallets table is empty, will seed data');
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
    
    // Seed wallet data for test users
    const walletData = [
      {
        user_id: 'user123',
        currency: 'USD',
        symbol: '$',
        balance: 200,
        active: true
      },
      {
        user_id: 'user456',
        currency: 'USD',
        symbol: '$',
        balance: 350,
        active: true
      },
      {
        user_id: 'user789',
        currency: 'USD',
        symbol: '$',
        balance: 500,
        active: true
      }
    ];
    
    // Check if wallets already exist for these users
    const existingWallets = await supabase
      .from('wallets')
      .select('user_id')
      .in('user_id', walletData.map(w => w.user_id));
      
    if (existingWallets.error) {
      console.error('Error checking existing wallets:', existingWallets.error);
    } else {
      // Filter out wallets that already exist
      const existingUserIds = new Set(existingWallets.data.map(w => w.user_id));
      const walletsToInsert = walletData.filter(w => !existingUserIds.has(w.user_id));
      
      if (walletsToInsert.length > 0) {
        const { error: walletsError } = await supabase
          .from('wallets')
          .insert(walletsToInsert);
        
        if (walletsError) {
          console.error('Error seeding wallets:', walletsError);
        } else {
          console.log('Wallets data seeded successfully');
        }
      } else {
        console.log('All test wallets already exist, skipping wallet seeding');
      }
    }
    
    // Seed some example transactions
    const sampleTransactions = [
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'deposit',
        amount: 100,
        currency: 'USD',
        status: 'completed',
        balance_before: 0,
        balance_after: 100
      },
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'bet',
        amount: 10,
        currency: 'USD',
        game_id: 'sweet-bonanza',
        status: 'completed',
        balance_before: 100,
        balance_after: 90
      },
      {
        player_id: 'user123',
        provider: 'Pragmatic Play',
        type: 'win',
        amount: 25,
        currency: 'USD',
        game_id: 'sweet-bonanza',
        status: 'completed',
        balance_before: 90,
        balance_after: 115
      },
      {
        player_id: 'user456',
        provider: 'Evolution Gaming',
        type: 'deposit',
        amount: 200,
        currency: 'USD',
        status: 'completed',
        balance_before: 0,
        balance_after: 200
      },
      {
        player_id: 'user456',
        provider: 'NetEnt',
        type: 'bet',
        amount: 15,
        currency: 'USD',
        game_id: 'starburst',
        status: 'completed',
        balance_before: 200,
        balance_after: 185
      },
      {
        player_id: 'user789',
        provider: 'Microgaming',
        type: 'win',
        amount: 150,
        currency: 'USD',
        game_id: 'immortal-romance',
        status: 'completed',
        balance_before: 50,
        balance_after: 200
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
