
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import Casino from './pages/Casino';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import GameAggregatorPage from './pages/admin/GameAggregator';
import NewGameAggregator from './pages/admin/NewGameAggregator';
import PPIntegrationTester from './pages/admin/PPIntegrationTester';
import Seamless from './pages/casino/Seamless';
import GitSlotParkSeamless from './pages/casino/GitSlotParkSeamless';
import AggregatorSeamless from './pages/casino/AggregatorSeamless';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/casino" element={<Casino />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/game-aggregator" element={<GameAggregatorPage />} />
        <Route path="/admin/new-game-aggregator" element={<NewGameAggregator />} />
        <Route path="/admin/pp-integration-tester" element={<PPIntegrationTester />} />
        <Route path="/casino/seamless" element={<Seamless />} />
        <Route path="/casino/gitslotpark-seamless" element={<GitSlotParkSeamless />} />
        <Route path="/casino/aggregator-seamless" element={<AggregatorSeamless />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
