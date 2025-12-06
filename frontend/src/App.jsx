import Navigation from './components/Navigation';
import IntroPage from './pages/IntroPage';
import EncryptPage from './pages/EncryptPage';
import DecryptPage from './pages/DecryptPage';
import FileViewPage from './pages/FileViewPage';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/encrypt" element={<EncryptPage />} />
        <Route path="/decrypt" element={<DecryptPage />} />
        <Route path="/file/:fileId" element={<FileViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
