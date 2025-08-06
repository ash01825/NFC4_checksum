import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

const UserRegistration = ({ onRegistrationComplete }) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Exporter', // Default to Exporter
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registerUser = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter your company name');
      return;
    }

    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Check if the current account is the contract owner
      const identityRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
        CONTRACT_ABIS.IDENTITY_REGISTRY,
        signer
      );

      // Try to register - this will only work if you're the owner
      try {
        const tx = await identityRegistry.registerParticipant(
          address,
          formData.name,
          formData.role
        );
        
        await tx.wait();
        alert('Registration successful! You are now verified.');
        onRegistrationComplete();
      } catch (error) {
        console.error('Registration error:', error);
        
        // If registration fails, it's likely because the user is not the owner
        if (error.message.includes('Ownable: caller is not the owner') || 
            error.message.includes('OwnableUnauthorizedAccount')) {
          alert('Registration requires admin approval. Please contact the platform administrator to register your account.');
        } else {
          alert('Registration failed: ' + error.message);
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error during registration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Registration Required</h2>
        <p className="text-gray-600">
          You need to be registered and verified to use the TradeTrust platform.
        </p>
      </div>

      <form onSubmit={registerUser} className="max-w-md mx-auto space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Company/Organization Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your company name"
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
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Exporter">Exporter</option>
            <option value="Importer">Importer</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select your role in international trade
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If you're not the contract owner, you'll need admin approval. 
            Contact the platform administrator with your wallet address: <br />
            <code className="bg-blue-100 px-1 rounded text-xs">{address}</code>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Already Registered?</h3>
        <p className="text-sm text-gray-600">
          If you believe you're already registered, try refreshing the page or contact support.
        </p>
        <button
          onClick={onRegistrationComplete}
          className="mt-2 text-primary-500 hover:text-primary-600 text-sm font-medium"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default UserRegistration;