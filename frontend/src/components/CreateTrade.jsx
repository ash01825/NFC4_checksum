import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, ESG_METRICS } from '../config/contracts';

const CreateTrade = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    importer: '',
    value: '',
    description: '',
    esgData: JSON.stringify(ESG_METRICS, null, 2),
  });

  useEffect(() => {
    if (isConnected && address) {
      checkVerification();
    }
  }, [isConnected, address]);

  const checkVerification = async () => {
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
        const role = await identityRegistry.getRole(address);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isVerified) {
      alert('You must be a verified participant to create trades');
      return;
    }

    if (userRole !== 'Exporter') {
      alert('Only exporters can create trades');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tradeContract = new ethers.Contract(
        CONTRACT_ADDRESSES.TRADE_AGREEMENT,
        CONTRACT_ABIS.TRADE_AGREEMENT,
        signer
      );

      const valueInWei = ethers.parseEther(formData.value);
      
      const tx = await tradeContract.createTrade(
        formData.importer,
        valueInWei,
        formData.description,
        formData.esgData
      );

      await tx.wait();
      
      alert('Trade created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Error creating trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your MetaMask wallet to create trades.</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Verified</h2>
        <p className="text-gray-600">You must be a verified participant to create trades.</p>
      </div>
    );
  }

  if (userRole !== 'Exporter') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
        <p className="text-gray-600">Only exporters can create trades. Your role: {userRole}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Trade</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Importer Address */}
          <div>
            <label htmlFor="importer" className="block text-sm font-medium text-gray-700 mb-2">
              Importer Address
            </label>
            <input
              type="text"
              id="importer"
              name="importer"
              value={formData.importer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0x..."
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the wallet address of the importer
            </p>
          </div>

          {/* Trade Value */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Trade Value (ETH)
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              step="0.001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.1"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the trade value in ETH
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Trade Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the goods or services being traded..."
              required
            />
          </div>

          {/* ESG Data */}
          <div>
            <label htmlFor="esgData" className="block text-sm font-medium text-gray-700 mb-2">
              ESG Metrics (JSON)
            </label>
            <textarea
              id="esgData"
              name="esgData"
              value={formData.esgData}
              onChange={handleInputChange}
              rows="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter ESG metrics in JSON format..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter environmental, social, and governance metrics in JSON format
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrade; 