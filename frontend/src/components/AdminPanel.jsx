import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

const AdminPanel = () => {
  const { address, isConnected } = useAccount();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    userAddress: '',
    name: '',
    role: 'Exporter'
  });

  useEffect(() => {
    if (isConnected && address) {
      checkOwnership();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const checkOwnership = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        CONTRACT_ABIS.IDENTITY_REGISTRY,
        provider
      );

      const owner = await identityRegistry.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registerUser = async (e) => {
    e.preventDefault();
    
    if (!registrationData.userAddress.trim() || !registrationData.name.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!ethers.isAddress(registrationData.userAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setActionLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        CONTRACT_ABIS.IDENTITY_REGISTRY,
        signer
      );

      const tx = await identityRegistry.registerParticipant(
        registrationData.userAddress,
        registrationData.name,
        registrationData.role
      );
      
      await tx.wait();
      
      alert(`User ${registrationData.name} registered successfully as ${registrationData.role}!`);
      
      // Reset form
      setRegistrationData({
        userAddress: '',
        name: '',
        role: 'Exporter'
      });
    } catch (error) {
      console.error('Error registering user:', error);
      
      if (error.message.includes('ERR: ALREADY_REGISTERED')) {
        alert('This address is already registered');
      } else {
        alert('Error registering user: ' + error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (!isConnected) {
    return null; // Don't show admin panel if not connected
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-center mt-2 text-gray-600">Checking admin privileges...</p>
      </div>
    );
  }

  if (!isOwner) {
    return null; // Don't show admin panel if not owner
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">⚙️</div>
        <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Contract Owner
        </span>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="text-yellow-400 mr-3">⚠️</div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Admin Access Detected</h3>
            <p className="text-sm text-yellow-700 mt-1">
              You are the contract owner and can register new participants directly.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={registerUser} className="space-y-4">
        <div>
          <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 mb-2">
            User Wallet Address
          </label>
          <input
            type="text"
            id="userAddress"
            name="userAddress"
            value={registrationData.userAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Company/Organization Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={registrationData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter company name"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={registrationData.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Exporter">Exporter</option>
            <option value="Importer">Importer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading ? 'Registering...' : 'Register User'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Register exporters and importers</p>
          <p>• Verify participant identities</p>
          <p>• Manage platform access control</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;