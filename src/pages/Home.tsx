
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-green-500">Thunder Casino</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            The ultimate online gaming experience with hundreds of games, secure transactions, and exciting rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/casino">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-md">
                  Play Now
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="px-8 py-6 text-lg rounded-md">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-md">
                    Sign Up Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
