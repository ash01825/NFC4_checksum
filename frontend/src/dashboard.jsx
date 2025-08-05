import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { CreateTradeForm } from './CreateTrade'; // Import the new form
import { TradeDetails } from './TradeDetails'; // Import the new details page

const API_URL = 'http://localhost:8000/api';

export function Dashboard() {
    const { address, isConnected } = useAccount();
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State to manage which view is active
    const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'details'
    const [selectedTradeId, setSelectedTradeId] = useState(null);

    const fetchTrades = async () => {
        if (!isConnected) return;
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_URL}/trades`);
            const userTrades = response.data.filter(
                (trade) =>
                    trade.exporter.toLowerCase() === address.toLowerCase() ||
                    trade.importer.toLowerCase() === address.toLowerCase()
            );
            setTrades(userTrades);
        } catch (err) {
            console.error("Failed to fetch trades:", err);
            setError('Failed to load trades. Please make sure the backend server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [address, isConnected]);

    const handleViewDetails = (tradeId) => {
        setSelectedTradeId(tradeId);
        setCurrentView('details');
    };

    const handleTradeCreated = () => {
        setCurrentView('list');
        fetchTrades(); // Refresh the list after a new trade is created
    }

    // --- Render Logic ---

    if (!isConnected) {
        return (
            <div className="mt-8 bg-gray-800/50 p-6 rounded-lg shadow-xl border border-gray-700 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-200">Welcome to TradeTrust</h2>
                <p className="text-gray-400">Please connect your wallet to view your trades.</p>
            </div>
        );
    }

    if (currentView === 'create') {
        return <CreateTradeForm onTradeCreated={handleTradeCreated} onCancel={() => setCurrentView('list')} />;
    }

    if (currentView === 'details') {
        return <TradeDetails tradeId={selectedTradeId} onBack={() => setCurrentView('list')} />;
    }

    // Default view is the list of trades
    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-200">Your Trades</h2>
                <button onClick={() => setCurrentView('create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    + Create New Trade
                </button>
            </div>

            {isLoading && <p className="text-center text-gray-400">Loading trades...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!isLoading && !error && trades.length === 0 && (
                <p className="text-center text-gray-500 mt-8">You have no trades yet.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trades.map((trade) => (
                    <TradeCard key={trade.id} trade={trade} currentUserAddress={address} onViewDetails={() => handleViewDetails(trade.id)} />
                ))}
            </div>
        </div>
    );
}

function TradeCard({ trade, currentUserAddress, onViewDetails }) {
    const role = trade.exporter.toLowerCase() === currentUserAddress.toLowerCase() ? 'Exporter' : 'Importer';
    const otherParty = role === 'Exporter' ? trade.importer : trade.exporter;
    const statusMap = { 0: { text: 'Created', color: 'bg-yellow-500/20 text-yellow-300' }, 1: { text: 'Funded', color: 'bg-blue-500/20 text-blue-300' }, 2: { text: 'In Transit', color: 'bg-indigo-500/20 text-indigo-300' }, 3: { text: 'Completed', color: 'bg-green-500/20 text-green-300' }, 4: { text: 'Cancelled', color: 'bg-red-500/20 text-red-300' },};
    const status = statusMap[trade.status] || { text: 'Unknown', color: 'bg-gray-500/20 text-gray-300' };

    return (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-5 shadow-lg flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                    <span className="text-xs text-gray-500">Trade #{trade.id}</span>
                </div>
                <h3 className="text-lg font-bold mt-3 text-gray-100">{trade.description}</h3>
                <p className="text-2xl font-light text-blue-400 my-2">{trade.value} ETH</p>
                <div className="text-sm text-gray-400 mt-4">
                    <p>Your Role: <span className="font-semibold text-gray-200">{role}</span></p>
                    <p>Other Party: <span className="font-mono text-xs text-gray-500 truncate">{otherParty}</span></p>
                </div>
            </div>
            <button onClick={onViewDetails} className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                View Details
            </button>
        </div>
    )
}
