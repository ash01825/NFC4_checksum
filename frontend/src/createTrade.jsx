import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { abi as tradeAgreementAbi } from '../../artifacts/contracts/TradeAgreement.sol/TradeAgreement.json';

// --- CONFIGURATION ---
const TRADE_AGREEMENT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Paste your deployed address here

export function CreateTradeForm({ onTradeCreated, onCancel }) {
    const [importerAddress, setImporterAddress] = useState('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [esgData, setEsgData] = useState('');

    const { writeContract, isPending, error } = useWriteContract();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!TRADE_AGREEMENT_ADDRESS) {
            alert("⚠️ Contract address not configured. Cannot create trade.");
            return;
        }

        if (!importerAddress || !value || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        writeContract({
            address: TRADE_AGREEMENT_ADDRESS,
            abi: tradeAgreementAbi,
            functionName: 'createTrade',
            args: [
                importerAddress,
                ethers.parseEther(value),
                description,
                esgData,
            ],
        }, {
            onSuccess: (txHash) => {
                console.log('Trade creation transaction sent:', txHash);
                alert('Trade creation successful! It will appear on the dashboard shortly.');
                onTradeCreated();
            },
            onError: (err) => {
                console.error('Trade creation error:', err);
                alert(`Error creating trade: ${err.shortMessage || err.message}`);
            }
        });
    };

    return (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100">Create New Trade Agreement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="importer" className="block text-sm font-medium text-gray-400">Importer's Wallet Address</label>
                    <input
                        id="importer"
                        type="text"
                        value={importerAddress}
                        onChange={(e) => setImporterAddress(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0x..."
                        required
                    />
                </div>
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-400">Trade Value (in ETH)</label>
                    <input
                        id="value"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1.5"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-400">Goods Description</label>
                    <textarea
                        id="description"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 500 Rolls of Premium Silk"
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="esg" className="block text-sm font-medium text-gray-400">ESG Data (e.g., certifications)</label>
                    <input
                        id="esg"
                        type="text"
                        value={esgData}
                        onChange={(e) => setEsgData(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., GOTS Certified, Fair Trade"
                    />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || !TRADE_AGREEMENT_ADDRESS}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Submitting...' : 'Create Trade'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">Error: {error.shortMessage || error.message}</p>}
                {!TRADE_AGREEMENT_ADDRESS && <p className="text-yellow-400 text-sm mt-2">⚠️ Contract not deployed. This form is disabled.</p>}
            </form>
        </div>
    );
}