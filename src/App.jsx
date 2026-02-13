import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/WalletPage';
import Marketplace from './pages/Marketplace';
import PublishService from './pages/PublishService';
import Disputes from './pages/Disputes';
import Onboarding from './pages/Onboarding';
import AuthPage from './pages/AuthPage';
import { Coins } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-4 shadow-glow-lg animate-pulse-slow">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white mb-1">EISC</h1>
        <p className="text-sm text-surface-500">Cargando ecosistema...</p>
        <div className="mt-4 w-32 h-1 bg-surface-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full animate-shimmer" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage />;

  return (
    <WalletProvider>
      <MarketplaceProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/publish" element={<PublishService />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </Layout>
      </MarketplaceProvider>
    </WalletProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
