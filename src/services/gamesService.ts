// @/services/gamesService.ts
import { Game, GameProvider, GameCategory, GameLaunchOptions, ApiResponse, DbGame } from '@/types';
import mockGames from '@/data/mock-games'; // Import mockGames
import { gameCategories, gameProviders } from '@/data/mock-platform-data'; // Import mock platform data

// Simulate API calls
const MOCK_API_DELAY = 300;

// Temporary games data store
let gamesDataStore: Game[] = [...mockGames];
let providersDataStore: GameProvider[] = [...gameProviders];
let categoriesDataStore: GameCategory[] = [...gameCategories];


const getGames = async (): Promise<Game[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [...gamesDataStore]; // Return a copy to prevent direct mutation
};

const getProviders = async (): Promise<GameProvider[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [...providersDataStore];
};

const getCategories = async (): Promise<GameCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  return [...categoriesDataStore];
};

const getGameById = async (id: string): Promise<Game | null> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  const game = gamesDataStore.find(g => g.id === id);
  return game || null;
};

const createSession = async (game: Game, options: GameLaunchOptions): Promise<ApiResponse<null>> => {
  console.log('Creating session for game:', game.title, 'with options:', options);
  await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
  // Simulate generating a game URL. In a real scenario, this would involve API calls to a game aggregator.
  const gameUrl = `/api/mock/launch/${game.id}?mode=${options.mode}&playerId=${options.playerId}&currency=${options.currency}`;
  return { success: true, gameUrl };
};

const incrementGameView = async (gameId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    gamesDataStore = gamesDataStore.map(game => 
        game.id === gameId ? { ...game, views: (game.views || 0) + 1 } : game
    );
    console.log(`View count for game ${gameId} incremented.`);
};

const addGame = async (gameData: Partial<DbGame>): Promise<DbGame | null> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const newGame: DbGame = {
        id: String(Date.now()), // Simple unique ID for mock
        title: gameData.title || 'New Game',
        // Map other DbGame fields from gameData
        provider_id: gameData.provider_id,
        provider_slug: providersDataStore.find(p => p.id === gameData.provider_id)?.slug,
        category_ids: gameData.category_ids,
        category_slugs: typeof gameData.category_slugs === 'string' ? gameData.category_slugs.split(',') : gameData.category_slugs,
        description: gameData.description,
        tags: gameData.tags,
        features: gameData.features,
        themes: gameData.themes,
        rtp: gameData.rtp,
        volatility: gameData.volatility,
        lines: gameData.lines,
        cover: gameData.cover,
        banner: gameData.banner,
        image_url: gameData.image_url,
        status: gameData.status || 'active',
        is_popular: gameData.is_popular || false,
        is_new: gameData.is_new || false,
        is_featured: gameData.is_featured || false,
        show_home: gameData.show_home || false,
        views: gameData.views || 0,
        order: gameData.order,
        min_bet: gameData.min_bet,
        max_bet: gameData.max_bet,
        has_jackpot: gameData.has_jackpot,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        release_date: gameData.release_date,
        game_code: gameData.game_code,
        game_id: gameData.game_id, // from provider
        slug: gameData.slug || gameData.title?.toLowerCase().replace(/\s+/g, '-'),
        launch_url: gameData.launch_url,
    };
    // This service expects Game, not DbGame for gamesDataStore. Adapt or convert.
    // For simplicity, we'll assume Game and DbGame are compatible enough for this mock or convert.
    const adaptedGameForStore = {
      ...newGame,
      provider: newGame.provider_slug || '',
      providerName: providersDataStore.find(p => p.slug === newGame.provider_slug)?.name,
      category: (newGame.category_slugs as string[] | undefined)?.[0] || '', // simplified
      categoryName: categoriesDataStore.find(c => c.slug === (newGame.category_slugs as string[] | undefined)?.[0])?.name,
      image: newGame.cover || newGame.image_url || '',
    } as Game;

    gamesDataStore.push(adaptedGameForStore);
    return newGame;
};

const updateGame = async (gameId: string, gameData: Partial<DbGame>): Promise<DbGame | null> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    let updatedGame: DbGame | null = null;
    gamesDataStore = gamesDataStore.map(g => {
        if (g.id === gameId) {
            // Convert existing Game to DbGame-like structure for update
            const dbGameRepresentation: DbGame = {
                ...g,
                title: g.title,
                provider_id: providersDataStore.find(p => p.slug === g.provider)?.id,
                provider_slug: g.provider,
                // category_ids and category_slugs are more complex to map back here
                // for simplicity, we'll keep existing or assume they are updated if provided in gameData
                category_slugs: g.category_slugs || g.category, 
                cover: g.image,
                updated_at: new Date().toISOString(),
            };
            
            updatedGame = { ...dbGameRepresentation, ...gameData, id: gameId } as DbGame;
            
            // Adapt back to Game for storing
            return {
                ...g, // keep original Game structure
                ...gameData, // apply updates from DbGame partial
                id: gameId,
                title: gameData.title || g.title,
                provider: gameData.provider_slug || g.provider,
                providerName: providersDataStore.find(p => p.slug === (gameData.provider_slug || g.provider))?.name,
                category: (gameData.category_slugs as string[] | undefined)?.[0] || g.category,
                categoryName: categoriesDataStore.find(c => c.slug === ((gameData.category_slugs as string[] | undefined)?.[0] || g.category))?.name,
                image: gameData.cover || gameData.image_url || g.image,
                updated_at: new Date().toISOString(),
            } as Game;
        }
        return g;
    });
    return updatedGame;
};

const deleteGame = async (gameId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
    const initialLength = gamesDataStore.length;
    gamesDataStore = gamesDataStore.filter(game => game.id !== gameId);
    return gamesDataStore.length < initialLength;
};

// Export as a single object
export const gamesService = {
  getGames,
  getProviders,
  getCategories,
  getGameById,
  createSession,
  incrementGameView,
  addGame,
  updateGame,
  deleteGame,
};
