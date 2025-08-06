import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, TRADE_STATUS } from '../config/contracts';
import UserRegistration from './UserRegistration';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
      loadTrades();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadUserData = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        CONTRACT_ABIS.IDENTITY_REGISTRY,
        provider
      );

      const verified = await identityRegistry.isVerified(address);
      setIsVerified(verified);

      if (verified) {
        try {
          const role = await identityRegistry.getRole(address);
          setUserRole(role);
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('');
        }
      } else {
        // User is not registered, show registration option
        setUserRole('');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsVerified(false);
      setUserRole('');
    }
  };

  const loadTrades = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        provider
      );

      const tradeCount = await tradeContract.tradeCounter();
      const userTrades = [];

      for (let i = 1; i <= tradeCount; i++) {
        try {
          const trade = await tradeContract.trades(i);
          if (trade.exporter === address || trade.importer === address) {
            userTrades.push({
              id: trade.id.toString(),
              exporter: trade.exporter,
              importer: trade.importer,
              value: ethers.formatEther(trade.value),
              description: trade.description,
              status: TRADE_STATUS[trade.status],
              latestUpdate: trade.latestShipmentUpdate,
              esgData: trade.esgData,
            });
          }
        } catch (error) {
          console.error(`Error loading trade ${i}:`, error);
        }
      }

      setTrades(userTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Created': return 'bg-yellow-100 text-yellow-800';
      case 'Funded': return 'bg-blue-100 text-blue-800';
      case 'InTransit': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your MetaMask wallet to access the dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your data...</p>
      </div>
    );
  }

  const handleRegistrationComplete = () => {
    // Reload user data after registration
    loadUserData();
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel - Shows if user is contract owner */}
      {isConnected && <AdminPanel />}

      {/* Registration Component - Show if user is not verified */}
      {isConnected && !isVerified && (
        <UserRegistration onRegistrationComplete={handleRegistrationComplete} />
      )}

      {/* Wallet Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-mono text-sm">{address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Balance</p>
            <p className="font-semibold">{balance?.formatted} ETH</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center">
              {isVerified ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700 font-medium">Verified {userRole}</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-700 font-medium">Not Verified</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to="/create-trade"
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
          >
            Create New Trade
          </Link>
          <Link
            to="/compliance"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            View Compliance Report
          </Link>
        </div>
      </div>

      {/* Trades */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Trades</h2>
        </div>
        <div className="p-6">
          {trades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-600">No trades found. Create your first trade to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <div key={trade.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">Trade #{trade.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                          {trade.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{trade.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Value:</span>
                          <p className="font-medium">{trade.value} ETH</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Exporter:</span>
                          <p className="font-mono text-xs">{trade.exporter}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Importer:</span>
                          <p className="font-mono text-xs">{trade.importer}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Latest Update:</span>
                          <p className="text-xs">{trade.latestUpdate}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/trade/${trade.id}`}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 