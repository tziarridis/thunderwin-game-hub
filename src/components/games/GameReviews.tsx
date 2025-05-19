
import React from 'react';

interface GameReviewsProps {
  gameId: string | number | undefined; // Keep existing prop
}

const GameReviews: React.FC<GameReviewsProps> = ({ gameId }) => {
  if (!gameId) return null; // Keep existing guard

  // Placeholder content
  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-3">Player Reviews</h3>
      <p className="text-muted-foreground">No reviews yet for this game. Be the first to write one!</p>
      {/* Placeholder for review submission form or list */}
    </div>
  );
};

export default GameReviews;
