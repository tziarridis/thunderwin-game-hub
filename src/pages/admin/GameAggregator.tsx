
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import GameAggregator from "@/components/admin/GameAggregator";

const GameAggregatorPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div>
      <GameAggregator />
    </div>
  );
};

export default GameAggregatorPage;
