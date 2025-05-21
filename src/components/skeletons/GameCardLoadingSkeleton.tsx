
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const GameCardLoadingSkeleton = () => {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative w-full bg-muted">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <Skeleton className="h-5 w-4/5 mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="p-3 pt-0 grid grid-cols-2 gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
};

export default GameCardLoadingSkeleton;
