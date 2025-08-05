import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { abi as tradeAgreementAbi } from '../../artifacts/contracts/TradeAgreement.sol/TradeAgreement.json';

// --- CONFIGURATION ---
const API_URL = 'http://localhost:8000/api';
const TRADE_AGREEMENT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Paste your deployed address here

export function TradeDetails({ tradeId, onBack }) {
    const { address } = useAccount();
    const [trade, setTrade] = useState(null);
    const [aiReport, setAiReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { writeContract, isPending } = useWriteContract();

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const tradeRes = await axios.get(`${API_URL}/trade/${tradeId}`);
                setTrade(tradeRes.data);

                const aiRes = await axios.post(`${API_URL}/analyze-trade`, {
                    description: tradeRes.data.description,
                    esgData: tradeRes.data.esgData,
                });
                setAiReport(aiRes.data);
            } catch (error) {
                console.error("Failed to fetch trade details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [tradeId]);

    const handleFundTrade = () => {
        if (!TRADE_AGREEMENT_ADDRESS) {
            alert("⚠️ Contract address not configured. Cannot fund trade.");
            return;
        }

        writeContract({
            address: TRADE_AGREEMENT_ADDRESS,
            abi: tradeAgreementAbi,
            functionName: 'fundTrade',
            args: [trade.id],
            value: ethers.parseEther(trade.value),
        }, {
            onSuccess: () => alert("Trade funded successfully!"),
            onError: (err) => alert(`Funding failed: ${err.shortMessage || err.message}`)
        });
    };

    const handleConfirmReceipt = () => {
        if (!TRADE_AGREEMENT_ADDRESS) {
            alert("⚠️ Contract address not configured. Cannot confirm receipt.");
            return;
        }

        writeContract({
            address: TRADE_AGREEMENT_ADDRESS,
            abi: tradeAgreementAbi,
            functionName: 'confirmReceipt',
            args: [trade.id],
        }, {
            onSuccess: () => alert("Receipt confirmed! Funds have been released."),
            onError: (err) => alert(`Confirmation failed: ${err.shortMessage || err.message}`)
        });
    };

    if (isLoading) return <p>Loading trade details...</p>;
    if (!trade) return <p>Could not load trade details.</p>;

    const isImporter = address?.toLowerCase() === trade.importer.toLowerCase();
    const statusMap = ['Created', 'Funded', 'In Transit', 'Completed', 'Cancelled'];

    return (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 shadow-lg">
            <button onClick={onBack} className="text-blue-400 mb-4">&larr; Back to Dashboard</button>
            <h2 className="text-3xl font-bold mb-2">{trade.description}</h2>
            <p className="text-gray-400">Trade #{trade.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 space-y-4">
                    <InfoCard title="Status" value={statusMap[trade.status]} />
                    <InfoCard title="Value" value={`${trade.value} ETH`} />
                    <InfoCard title="Exporter" value={trade.exporter} isAddress />
                    <InfoCard title="Importer" value={trade.importer} isAddress />
                    <InfoCard title="Latest Update" value={trade.latestShipmentUpdate} />
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-lg mb-2">AI Compliance Report</h3>
                        {aiReport ? (
                            <>
                                <p>Risk Score: <span className={`font-bold ${aiReport.riskScore > 5 ? 'text-red-500' : 'text-green-500'}`}>{aiReport.riskScore}/10</span></p>
                                <p className="text-sm text-gray-400 mt-1">{aiReport.explanation}</p>
                            </>
                        ) : <p>Loading report...</p>}
                    </div>

                    {isImporter && (
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-lg mb-3">Actions</h3>
                            {trade.status === 0 && (
                                <button
                                    onClick={handleFundTrade}
                                    disabled={isPending || !TRADE_AGREEMENT_ADDRESS}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    {isPending ? 'Funding...' : 'Fund Escrow'}
                                </button>
                            )}
                            {trade.status === 2 && (
                                <button
                                    onClick={handleConfirmReceipt}
                                    disabled={isPending || !TRADE_AGREEMENT_ADDRESS}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    {isPending ? 'Confirming...' : 'Confirm Receipt'}
                                </button>
                            )}
                            {trade.status !== 0 && trade.status !== 2 && (
                                <p className="text-sm text-gray-500">No actions available at this time.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ title, value, isAddress = false }) {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm text-gray-400">{title}</h4>
            <p className={`text-lg ${isAddress ? 'font-mono text-xs' : 'font-semibold'} text-white truncate`}>{value}</p>
        </div>
    );
}