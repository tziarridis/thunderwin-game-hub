
import PlaceholderPage from "@/components/PlaceholderPage";
import { HelpCircle } from "lucide-react";

const HelpPage = () => {
  return (
    <PlaceholderPage 
      title="Help Center" 
      description="Find answers to frequently asked questions, guides on how to play, and get support for any issues you might encounter."
      icon={<HelpCircle size={40} />}
    />
  );
};

export default HelpPage;
