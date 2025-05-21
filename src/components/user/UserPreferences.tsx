
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UserPreferences = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User preferences settings will be displayed here.</p>
        {/* Placeholder for user preferences content */}
      </CardContent>
    </Card>
  );
};

export default UserPreferences;
