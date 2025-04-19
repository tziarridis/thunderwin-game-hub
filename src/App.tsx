
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/AppLayout';
import Home from './pages/Index';
import NotFound from './pages/NotFound';
import GameAggregatorPage from './pages/admin/GameAggregator';
import NewGameAggregator from './pages/admin/NewGameAggregator';
import PPIntegrationTester from './pages/admin/PPIntegrationTester';
import Seamless from './pages/casino/Seamless';
import GitSlotParkSeamless from './pages/casino/GitSlotParkSeamless';
import AggregatorSeamless from './pages/casino/AggregatorSeamless';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
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
