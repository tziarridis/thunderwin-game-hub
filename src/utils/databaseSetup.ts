
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility to set up the database schema
 * In a real production environment, this would be managed by migrations
 * This is a simplified version for demo purposes
 */
export const setupDatabase = async () => {
  try {
    // Only run in server environment
    if (typeof window !== 'undefined') {
      console.log('Database setup should only be run in a server environment');
      return;
    }

    console.log('Starting database setup...');
    
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'src/utils/dbInitializer.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Since db.query doesn't exist, we'll use supabase
    for (const statement of statements) {
      await supabase.rpc('executeSQL', { sql: statement }).catch(err => {
        console.error('Error executing SQL:', err);
      });
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
    // Only run in server environment
    if (typeof window !== 'undefined') {
      console.log('Database seeding should only be run in a server environment');
      return;
    }

    console.log('Seeding test data...');
    
    // Example: Insert some test providers
    const providersData = [
      { name: 'Pragmatic Play', logo: '/providers/pragmatic.png', status: 'active' },
      { name: 'Evolution Gaming', logo: '/providers/evolution.png', status: 'active' },
      { name: 'NetEnt', logo: '/providers/netent.png', status: 'active' },
      { name: 'Microgaming', logo: '/providers/microgaming.png', status: 'active' },
      { name: 'Play\'n GO', logo: '/providers/playngo.png', status: 'active' }
    ];
    
    for (const provider of providersData) {
      // Use supabase to insert data instead of db.query
      await supabase
        .from('providers')
        .insert({
          name: provider.name,
          logo: provider.logo,
          status: provider.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .catch(err => {
          console.error('Error inserting provider:', err);
        });
    }
    
    // Example: Insert game categories
    const categoriesData = [
      { name: 'Slots', slug: 'slots', status: 'active', show_home: 1 },
      { name: 'Table Games', slug: 'table-games', status: 'active', show_home: 1 },
      { name: 'Live Casino', slug: 'live-casino', status: 'active', show_home: 1 },
      { name: 'Jackpot Games', slug: 'jackpot-games', status: 'active', show_home: 1 },
      { name: 'Video Poker', slug: 'video-poker', status: 'active', show_home: 0 }
    ];
    
    for (const category of categoriesData) {
      // Use supabase to insert data instead of db.query
      await supabase
        .from('game_categories')
        .insert({
          name: category.name,
          slug: category.slug,
          status: category.status,
          show_home: category.show_home,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .catch(err => {
          console.error('Error inserting category:', err);
        });
    }
    
    console.log('Test data seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding test data:', error);
    return false;
  }
};
