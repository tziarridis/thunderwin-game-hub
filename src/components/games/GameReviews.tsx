
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export interface GameReviewsProps {
  gameId: string;
}

const GameReviews: React.FC<GameReviewsProps> = ({ gameId }) => {
  const mockReviews = [
    {
      id: '1',
      user: 'Player123',
      rating: 5,
      comment: 'Great game with excellent graphics!',
      date: '2024-01-15',
    },
    {
      id: '2',
      user: 'GamerPro',
      rating: 4,
      comment: 'Fun gameplay but could use more features.',
      date: '2024-01-10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockReviews.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{review.user}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GameReviews;
