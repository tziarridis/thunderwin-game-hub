
import React from 'react';
import { Promotion } from '@/types'; // Using the new Promotion type
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ExternalLink, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PromotionCardProps {
  promotion: Promotion;
  className?: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, className }) => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    if (promotion.cta_link) {
      if (promotion.cta_link.startsWith('http')) {
        window.open(promotion.cta_link, '_blank');
      } else {
        navigate(promotion.cta_link);
      }
    }
  };

  return (
    <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group ${className}`}>
      {promotion.image_url && (
        <CardHeader className="p-0">
          <AspectRatio ratio={16 / 9}>
            <img
              src={promotion.image_url}
              alt={promotion.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </AspectRatio>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <CardTitle className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {promotion.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {promotion.description}
        </CardDescription>
        {(promotion.start_date || promotion.end_date) && (
            <p className="text-xs text-muted-foreground">
                {promotion.start_date && `Starts: ${new Date(promotion.start_date).toLocaleDateString()}`}
                {promotion.start_date && promotion.end_date && " - "}
                {promotion.end_date && `Ends: ${new Date(promotion.end_date).toLocaleDateString()}`}
            </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {promotion.cta_text && promotion.cta_link && (
          <Button onClick={handleCTAClick} className="w-full sm:w-auto">
            {promotion.cta_text}
            {promotion.cta_link.startsWith('http') && <ExternalLink className="ml-2 h-4 w-4" />}
          </Button>
        )}
        {promotion.terms_conditions_link && (
          <Button
            variant="link"
            onClick={() => window.open(promotion.terms_conditions_link, '_blank')}
            className="text-xs p-0 h-auto text-muted-foreground hover:text-primary"
          >
            <Info className="mr-1 h-3 w-3" /> Terms & Conditions
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;
