
import React from "react";
import { Navigate } from "react-router-dom";

// Since we already have Index.tsx as our home page, redirect to index
const Home = () => {
  return <Navigate to="/" replace />;
};

export default Home;
