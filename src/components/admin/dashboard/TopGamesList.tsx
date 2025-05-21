
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GameStat {
  id: string;
  title: string;
  plays: number;
  revenue?: number;
}

interface TopGamesListProps {
  games: GameStat[] | null;
  isLoading: boolean;
}

const TopGamesList: React.FC<TopGamesListProps> = ({ games, isLoading }) => {
   if (isLoading) {
    return <Card><CardHeader><CardTitle>Top Games</CardTitle></CardHeader><CardContent><p>Loading top games...</p></CardContent></Card>;
  }
  if (!games || games.length === 0) {
    return <Card><CardHeader><CardTitle>Top Games</CardTitle></CardHeader><CardContent><p>No game data available.</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Games by Plays</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead className="text-right">Plays</TableHead>
              {games[0]?.revenue !== undefined && <TableHead className="text-right">Revenue</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.slice(0, 5).map((game) => ( // Show top 5
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell className="text-right">{game.plays.toLocaleString()}</TableCell>
                {game.revenue !== undefined && <TableCell className="text-right">${game.revenue.toLocaleString()}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopGamesList;
