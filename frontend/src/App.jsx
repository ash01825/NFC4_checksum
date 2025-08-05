import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Import components
import Dashboard from './components/Dashboard';
import CreateTrade from './components/CreateTrade';
import TradeDetails from './components/TradeDetails';
import ComplianceReport from './components/ComplianceReport';
import Navigation from './components/Navigation';

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [hardhat],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'TradeTrust',
  projectId: 'YOUR_PROJECT_ID', // Replace with actual project ID
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">TradeTrust</h1>
                    <span className="ml-2 text-sm text-gray-500">NFC4 Cross-Border Trade</span>
                  </div>
                  <ConnectButton />
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Navigation />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-trade" element={<CreateTrade />} />
                <Route path="/trade/:id" element={<TradeDetails />} />
                <Route path="/compliance" element={<ComplianceReport />} />
              </Routes>
            </div>
          </div>
        </Router>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;