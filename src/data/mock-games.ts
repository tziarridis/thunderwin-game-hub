
import { Game, GameStatusEnum } from '@/types/game';

export const mockGames: Game[] = [
  {
    id: '1',
    title: 'Mega Fortune',
    game_name: 'Mega Fortune',
    slug: 'mega-fortune',
    provider_name: 'NetEnt',
    provider_slug: 'netent',
    category_name: 'slots',
    category_slugs: ['slots'],
    image_url: '/placeholder.svg',
    rtp: 96.4,
    volatility: 'high',
    is_featured: true,
    isPopular: true,
    status: GameStatusEnum.ACTIVE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Book of Dead',
    game_name: 'Book of Dead',
    slug: 'book-of-dead',
    provider_name: 'Play\'n GO',
    provider_slug: 'playngo',
    category_name: 'slots',
    category_slugs: ['slots'],
    image_url: '/placeholder.svg',
    rtp: 96.2,
    volatility: 'high',
    is_featured: true,
    isPopular: true,
    status: GameStatusEnum.ACTIVE,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
