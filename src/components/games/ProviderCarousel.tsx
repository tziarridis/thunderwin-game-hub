
import React from 'react';
import { Button } from '@/components/ui/button';

export interface ProviderCarouselProps {
  providers: { id: string; name: string; logoUrl?: string; slug: string }[];
  activeProvider: string;
  onSelectProvider: (slug: string) => void;
}

const ProviderCarousel: React.FC<ProviderCarouselProps> = ({
  providers,
  activeProvider,
  onSelectProvider
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeProvider === 'all' ? 'default' : 'outline'}
        onClick={() => onSelectProvider('all')}
        className="mb-2"
      >
        All Providers
      </Button>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant={activeProvider === provider.slug ? 'default' : 'outline'}
          onClick={() => onSelectProvider(provider.slug)}
          className="mb-2"
        >
          {provider.name}
        </Button>
      ))}
    </div>
  );
};

export default ProviderCarousel;
