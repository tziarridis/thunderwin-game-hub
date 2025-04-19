
import PlaceholderPage from "@/components/PlaceholderPage";
import { User } from "lucide-react";

const ProfilePage = () => {
  return (
    <PlaceholderPage 
      title="User Profile" 
      description="Manage your account settings, view your betting history, and check your balance and bonuses."
      icon={<User size={40} />}
    />
  );
};

export default ProfilePage;
