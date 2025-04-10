
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-casino-thunder-darker">
      <div className="text-center p-8 thunder-card max-w-md">
        <h1 className="text-6xl font-bold mb-6 text-casino-thunder-green thunder-glow">404</h1>
        <p className="text-xl text-white mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
