
import { GameData, GameImportResult, GameExportResult } from '@/types/gameService';
import { createGame } from './gameDbService';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only try to import fs if we're in a Node.js environment
let fs = null;

if (!isBrowser) {
  try {
    fs = require('fs');
  } catch (error) {
    console.error('Error importing Node.js fs module:', error);
  }
}

/**
 * Import games from JSON file (server-side only)
 */
export const importGamesFromJson = async (filePath: string): Promise<GameImportResult> => {
  if (isBrowser || !fs) {
    console.error('Cannot import games in browser environment');
    return { success: false, message: 'Import only available in server environment' };
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const games = JSON.parse(data);
    
    if (!Array.isArray(games)) {
      return { success: false, message: 'Invalid JSON format, expected array' };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const game of games) {
      try {
        await createGame(game);
        successCount++;
      } catch (error) {
        console.error('Error importing game:', error);
        errorCount++;
      }
    }
    
    return {
      success: true,
      message: `Import complete. ${successCount} games imported, ${errorCount} errors.`,
      imported: successCount,
      errors: errorCount
    };
  } catch (error: any) {
    console.error('Error importing games from JSON:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Export all games to JSON (server-side only)
 */
export const exportGamesToJson = async (
  filePath: string, 
  games: GameData[]
): Promise<GameExportResult> => {
  if (isBrowser || !fs) {
    console.error('Cannot export games in browser environment');
    return { success: false, message: 'Export only available in server environment' };
  }
  
  try {
    const jsonData = JSON.stringify(games, null, 2);
    
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    return {
      success: true,
      message: `Export complete. ${games.length} games exported.`,
      count: games.length
    };
  } catch (error: any) {
    console.error('Error exporting games to JSON:', error);
    return { success: false, message: error.message };
  }
};

export default {
  importGamesFromJson,
  exportGamesToJson
};
