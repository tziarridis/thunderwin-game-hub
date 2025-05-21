
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UserActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User activity information will be displayed here.</p>
        {/* Placeholder for user activity content */}
      </CardContent>
    </Card>
  );
};

export default UserActivity;
