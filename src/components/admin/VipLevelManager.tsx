
import React from 'react';
import { VIPLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VipLevelManagerProps {
  levels: VIPLevel[];
  onSave: (id: string, data: Partial<VIPLevel>) => Promise<VIPLevel>;
}

const VipLevelManager: React.FC<VipLevelManagerProps> = ({ levels, onSave }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {levels.map((level) => (
        <Card key={level.id}>
          <CardHeader>
            <CardTitle>{level.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Required Points: {level.required_points}</p>
            <div className="mt-2">
              <h4 className="font-semibold">Benefits:</h4>
              <ul className="list-disc list-inside">
                {level.benefits.map((benefit, index) => (
                  <li key={index}>{benefit.description}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VipLevelManager;
