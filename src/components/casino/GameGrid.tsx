
// This file is deprecated and should be deleted.
// Use CasinoGameGrid.tsx instead.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import CasinoGameGrid from './CasinoGameGrid';

// This component is kept for backward compatibility only
// It redirects to the new CasinoGameGrid component
const GameGrid = (props) => {
  console.warn('GameGrid component is deprecated, please use CasinoGameGrid instead');
  return <CasinoGameGrid {...props} />;
};

export default GameGrid;
