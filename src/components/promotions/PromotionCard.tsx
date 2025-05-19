
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Promotion } from '@/types'; // Import the Promotion type
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface PromotionCardProps {
  promotion: Promotion;
  className?: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, className }) => {
  return (
    <Card className={cn("overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group", className)}>
      {promotion.imageUrl && (
        <CardHeader className="p-0 relative aspect-[16/9] overflow-hidden">
          <img 
            src={promotion.imageUrl} 
            alt={promotion.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
           {promotion.status === 'new' && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold rounded">
              NEW
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className="p-4 md:p-6 flex-grow">
        <CardTitle className="text-xl lg:text-2xl mb-2 group-hover:text-primary transition-colors">{promotion.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">{promotion.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 md:p-6 border-t">
        {promotion.link ? (
          <Button asChild className="w-full" variant="default">
            <Link to={promotion.link}>
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          // Fallback or different action if no direct link
          <Button className="w-full" variant="secondary" disabled>Details Unavailable</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;
