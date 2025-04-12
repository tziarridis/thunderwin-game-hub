
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type PlaceholderPageProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

const PlaceholderPage = ({
  title,
  description = "This page is currently under development. Check back soon for more content.",
  icon,
}: PlaceholderPageProps) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast.info(`Viewing ${title} page`);
  }, [title]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 text-center max-w-3xl mx-auto">
        <div className="mb-4 flex justify-center">
          {icon && (
            <div className="text-casino-thunder-green h-16 w-16">
              {icon}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-white/70 mb-8">{description}</p>
        <Button 
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
