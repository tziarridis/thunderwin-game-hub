
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/layout/ScrollToTop";
import TableGamesPage from "./pages/casino/TableGames";
import NewGamesPage from "./pages/casino/NewGames";
import Providers from "./pages/casino/Providers";
import KycStatusPage from "./pages/kyc/KycStatus";
import Index from "./pages/Index";
import Sports from "./pages/sports";
import LiveCasinoPage from "./pages/casino/LiveCasino";
import SlotsPage from "./pages/casino/Slots";
import JackpotsPage from "./pages/casino/Jackpots";
import HelpPage from "./pages/support/Help";
import ProfilePage from "./pages/user/Profile";
import BonusHub from "./pages/bonuses/BonusHub";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Index />} />
          <Route path="/casino" element={<NotFound />} />
          <Route path="/casino/table-games" element={<TableGamesPage />} />
          <Route path="/casino/new-games" element={<NewGamesPage />} />
          <Route path="/casino/providers" element={<Providers />} />
          <Route path="/casino/slots" element={<SlotsPage />} />
          <Route path="/casino/live-casino" element={<LiveCasinoPage />} />
          <Route path="/casino/jackpots" element={<JackpotsPage />} />
          <Route path="/games" element={<NotFound />} />
          <Route path="/games/:id" element={<NotFound />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bonuses" element={<BonusHub />} />
          <Route path="/admin" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<NotFound />} />
          <Route path="/register" element={<NotFound />} />
          <Route path="/forgot-password" element={<NotFound />} />
          <Route path="/reset-password/:token" element={<NotFound />} />
          <Route path="/kyc/status" element={<KycStatusPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/game-management" element={<NotFound />} />
          <Route path="/admin/user-management" element={<NotFound />} />
          <Route path="/admin/settings" element={<NotFound />} />
          <Route path="/admin/pp-integration" element={<NotFound />} />
          <Route path="/admin/game-aggregator" element={<NotFound />} />
          
          {/* Casino routes */}
          <Route path="/casino/gitslotpark-seamless" element={<NotFound />} />
          
          {/* Sports routes */}
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/football" element={<NotFound />} />
          <Route path="/sports/basketball" element={<NotFound />} />
          <Route path="/sports/tennis" element={<NotFound />} />
          <Route path="/sports/hockey" element={<NotFound />} />
          <Route path="/sports/esports" element={<NotFound />} />
          
          {/* Support routes */}
          <Route path="/support/help" element={<HelpPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
