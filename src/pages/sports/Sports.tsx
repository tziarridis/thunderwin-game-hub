
import React from "react";
import PlaceholderPage from "@/components/PlaceholderPage";
import { Trophy } from "lucide-react";

const Sports = () => {
  return (
    <PlaceholderPage 
      title="Sports Betting" 
      description="Place bets on your favorite sports including football, basketball, tennis, hockey, and esports."
      icon={<Trophy size={40} />}
    />
  );
};

export default Sports;
