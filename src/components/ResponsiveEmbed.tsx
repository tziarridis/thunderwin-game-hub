
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ResponsiveEmbedProps {
  src: string;
  title?: string;
  ratio?: number; // e.g., 16 / 9
}

const ResponsiveEmbed = ({ src, title, ratio = 16 / 9 }: ResponsiveEmbedProps) => {
  return (
    <div className="w-full bg-black rounded-lg shadow-xl overflow-hidden">
      <AspectRatio ratio={ratio}>
        <iframe
          src={src}
          title={title || 'Embedded Content'}
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" // Common sandbox attributes for game iframes
        />
      </AspectRatio>
    </div>
  );
};

export default ResponsiveEmbed;
