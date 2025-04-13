
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import GitSlotParkSeamless from './pages/casino/GitSlotParkSeamless';
import GitSlotParkTester from './components/games/GitSlotParkTester';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<GitSlotParkTester />} />
          <Route path="/casino/gitslotpark-seamless" element={<GitSlotParkSeamless />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
};

export default App;
