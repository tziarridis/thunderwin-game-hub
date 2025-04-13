
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CMSCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const CMSCard = ({ title, description, children }: CMSCardProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-gray-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default CMSCard;
