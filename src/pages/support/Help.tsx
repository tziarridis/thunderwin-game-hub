
import PlaceholderPage from "@/components/PlaceholderPage";
import { HelpCircle } from "lucide-react";

const HelpCenterPage = () => {
  return (
    <PlaceholderPage 
      title="Help Center" 
      description="Find answers to common questions about our services, deposits, withdrawals, and more. Our comprehensive help center provides guides and tutorials to enhance your experience."
      icon={<HelpCircle size={40} />}
    />
  );
};

export default HelpCenterPage;
