
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPageLoadingSkeletonProps {
  title?: string;
}

const UserPageLoadingSkeleton: React.FC<UserPageLoadingSkeletonProps> = ({ title }) => {
  return (
    <div className="container mx-auto p-6">
      {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-md">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-md">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-12 rounded" />
            <Skeleton className="h-12 rounded" />
            <Skeleton className="h-12 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPageLoadingSkeleton;
