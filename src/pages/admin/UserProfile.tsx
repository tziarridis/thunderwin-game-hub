import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { Wallet, UserProfileData, WalletTransaction } from '@/types'; // UserProfileData might be defined elsewhere
import { toast } from "sonner";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Fetch user profile data (adjust service call as needed)
        // const profileData = await userService.getUserProfileById(userId);
        // setUserProfile(profileData);

        // Fetch wallet data
        const walletResponse = await walletService.getWalletByUserId(userId);
        if (walletResponse.success && walletResponse.data) {
          setWallet(mapDbWalletToWallet(walletResponse.data));
        } else if (walletResponse.error) {
          toast.error(`Failed to load wallet: ${walletResponse.error}`);
        } else {
          // No wallet data, but no error (e.g. wallet not yet created for user)
          setWallet(null); 
        }
        
        // Fetch transactions (example)
        // const transactionsData = await transactionService.getTransactionsByUserId(userId);
        // setTransactions(transactionsData);

      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to load user data.");
        toast.error(err.message || "Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) return <p>Loading user profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!userProfile && !wallet) return <p>No user data found.</p>; // Adjust based on what defines a valid profile

  return (
    <div>
      <h2>User Profile: {userId}</h2>
      {userProfile && (
        <div>
          {/* Display userProfile details */}
        </div>
      )}
      {wallet && (
        <div>
          <h3>Wallet</h3>
          <p>Balance: {wallet.symbol}{wallet.balance.toLocaleString()} {wallet.currency}</p>
          {/* Display other wallet details */}
        </div>
      )}
      {/* ... other sections like transactions, actions ... */}
    </div>
  );
};

export default UserProfilePage;
