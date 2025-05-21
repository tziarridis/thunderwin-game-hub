
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TwoFactorAuthSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">Enhance your account security by enabling Two-Factor Authentication (2FA).</p>
        <div>
          <p className="text-sm font-medium">Current Status: <span className="text-destructive">Disabled</span></p>
          {/* In a real implementation, this would reflect actual status */}
        </div>
        <Button disabled>Enable 2FA</Button>
        <p className="text-xs text-muted-foreground">
          Once enabled, you'll be prompted for a verification code from your authenticator app when you log in.
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuthSettings;
