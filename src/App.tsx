import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Casino from "./pages/Casino";
import Games from "./pages/Games";
import GameDetails from "./pages/GameDetails";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GameManagement from "./pages/admin/GameManagement";
import UserManagement from "./pages/admin/UserManagement";
import Settings from "./pages/admin/Settings";
import PPIntegrationTester from "./pages/admin/PPIntegrationTester";
import GameAggregator from "./pages/admin/GameAggregator";
import GitSlotParkSeamless from "./pages/casino/GitSlotParkSeamless";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/casino" element={<Casino />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Admin routes */}
        <Route path="/admin/game-management" element={<GameManagement />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/pp-integration" element={<PPIntegrationTester />} />
        <Route path="/admin/game-aggregator" element={<GameAggregator />} />
        
        {/* Casino routes */}
        <Route path="/casino/gitslotpark-seamless" element={<GitSlotParkSeamless />} />
      </Route>
    </Routes>
  );
}

export default App;
