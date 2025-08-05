import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, TRADE_STATUS } from '../config/contracts';

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      loadTradeDetails();
      loadUserRole();
    } else {
      setLoading(false);
    }
  }, [isConnected, address, id]);

  const loadTradeDetails = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        provider
      );

      const tradeData = await tradeContract.trades(id);
      
      setTrade({
        id: tradeData.id.toString(),
        exporter: tradeData.exporter,
        importer: tradeData.importer,
        value: ethers.formatEther(tradeData.value),
        description: tradeData.description,
        status: TRADE_STATUS[tradeData.status],
        statusCode: tradeData.status,
        latestUpdate: tradeData.latestShipmentUpdate,
        esgData: tradeData.esgData,
        escrowVault: tradeData.escrowVault,
      });
    } catch (error) {
      console.error('Error loading trade details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        CONTRACT_ABIS.IDENTITY_REGISTRY,
        provider
      );

      const role = await identityRegistry.getRole(address);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const fundTrade = async () => {
    if (!trade) return;
    
    setActionLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        signer
      );

      const valueInWei = ethers.parseEther(trade.value);
      
      const tx = await tradeContract.fundTrade(id, { value: valueInWei });
      await tx.wait();
      
      alert('Trade funded successfully!');
      loadTradeDetails();
    } catch (error) {
      console.error('Error funding trade:', error);
      alert('Error funding trade: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateShipmentStatus = async () => {
    if (!newStatus.trim()) {
      alert('Please enter a status update');
      return;
    }
    
    setActionLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        signer
      );

      const tx = await tradeContract.updateShipmentStatus(id, newStatus);
      await tx.wait();
      
      alert('Shipment status updated successfully!');
      setNewStatus('');
      loadTradeDetails();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      alert('Error updating shipment status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReceipt = async () => {
    setActionLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        signer
      );

      const tx = await tradeContract.confirmReceipt(id);
      await tx.wait();
      
      alert('Trade completed successfully!');
      loadTradeDetails();
    } catch (error) {
      console.error('Error confirming receipt:', error);
      alert('Error confirming receipt: ' + error.message);
    } finally {
      setActionLoading(false);
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

  const canFund = trade && address === trade.importer && trade.statusCode === 0;
  const canUpdateStatus = trade && address === trade.exporter && (trade.statusCode === 1 || trade.statusCode === 2);
  const canConfirmReceipt = trade && address === trade.importer && (trade.statusCode === 1 || trade.statusCode === 2);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your MetaMask wallet to view trade details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading trade details...</p>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Not Found</h2>
        <p className="text-gray-600">The requested trade could not be found.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trade #{trade.id}</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Trade Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Trade Overview</h2>
            <p className="text-gray-600">{trade.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trade.status)}`}>
            {trade.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trade Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Value:</span>
                <p className="font-semibold">{trade.value} ETH</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Exporter:</span>
                <p className="font-mono text-sm">{trade.exporter}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Importer:</span>
                <p className="font-mono text-sm">{trade.importer}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Escrow Vault:</span>
                <p className="font-mono text-sm">{trade.escrowVault}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Update</h3>
            <p className="text-gray-700">{trade.latestUpdate}</p>
          </div>
        </div>
      </div>

      {/* ESG Data */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ESG Metrics</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{trade.esgData}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trade Actions</h3>
        
        <div className="space-y-4">
          {canFund && (
            <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Fund Trade</h4>
              <p className="text-blue-700 mb-3">As the importer, you can fund this trade with {trade.value} ETH.</p>
              <button
                onClick={fundTrade}
                disabled={actionLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Fund Trade'}
              </button>
            </div>
          )}

          {canUpdateStatus && (
            <div className="p-4 border border-purple-200 rounded-md bg-purple-50">
              <h4 className="font-medium text-purple-900 mb-2">Update Shipment Status</h4>
              <p className="text-purple-700 mb-3">As the exporter, you can update the shipment status.</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="Enter status update..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={updateShipmentStatus}
                  disabled={actionLoading || !newStatus.trim()}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          )}

          {canConfirmReceipt && (
            <div className="p-4 border border-green-200 rounded-md bg-green-50">
              <h4 className="font-medium text-green-900 mb-2">Confirm Receipt</h4>
              <p className="text-green-700 mb-3">As the importer, you can confirm receipt and complete the trade.</p>
              <button
                onClick={confirmReceipt}
                disabled={actionLoading}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Receipt'}
              </button>
            </div>
          )}

          {!canFund && !canUpdateStatus && !canConfirmReceipt && (
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-gray-600">No actions available for this trade at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeDetails; 