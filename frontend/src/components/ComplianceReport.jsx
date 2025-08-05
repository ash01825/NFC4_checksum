import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config/contracts';

const ComplianceReport = () => {
  const { address, isConnected } = useAccount();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complianceScore, setComplianceScore] = useState(0);
  const [esgMetrics, setEsgMetrics] = useState({
    environmental: { score: 0, count: 0 },
    social: { score: 0, count: 0 },
    governance: { score: 0, count: 0 },
  });

  useEffect(() => {
    if (isConnected && address) {
      loadComplianceData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadComplianceData = async () => {
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
              value: ethers.formatEther(trade.value),
              esgData: trade.esgData,
              status: trade.status,
            });
          }
        } catch (error) {
          console.error(`Error loading trade ${i}:`, error);
        }
      }

      setTrades(userTrades);
      calculateComplianceMetrics(userTrades);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceMetrics = (trades) => {
    let totalComplianceScore = 0;
    let totalTrades = trades.length;
    let environmentalScore = 0;
    let socialScore = 0;
    let governanceScore = 0;
    let environmentalCount = 0;
    let socialCount = 0;
    let governanceCount = 0;

    trades.forEach(trade => {
      try {
        const esgData = JSON.parse(trade.esgData);
        
        // Calculate environmental score
        if (esgData.environmental) {
          const envScore = (
            (esgData.environmental.carbonFootprint || 0) +
            (esgData.environmental.renewableEnergy || 0) +
            (esgData.environmental.wasteManagement || 0)
          ) / 3;
          environmentalScore += envScore;
          environmentalCount++;
        }

        // Calculate social score
        if (esgData.social) {
          const socScore = (
            (esgData.social.laborStandards || 0) +
            (esgData.social.communityImpact || 0) +
            (esgData.social.diversity || 0)
          ) / 3;
          socialScore += socScore;
          socialCount++;
        }

        // Calculate governance score
        if (esgData.governance) {
          const govScore = (
            (esgData.governance.transparency || 0) +
            (esgData.governance.compliance || 0) +
            (esgData.governance.ethics || 0)
          ) / 3;
          governanceScore += govScore;
          governanceCount++;
        }

        // Overall compliance score (based on completed trades)
        if (trade.status === 3) { // Completed
          totalComplianceScore += 100;
        } else if (trade.status === 2) { // In Transit
          totalComplianceScore += 75;
        } else if (trade.status === 1) { // Funded
          totalComplianceScore += 50;
        } else if (trade.status === 0) { // Created
          totalComplianceScore += 25;
        }
      } catch (error) {
        console.error('Error parsing ESG data:', error);
      }
    });

    setComplianceScore(totalTrades > 0 ? totalComplianceScore / totalTrades : 0);
    setEsgMetrics({
      environmental: { 
        score: environmentalCount > 0 ? environmentalScore / environmentalCount : 0, 
        count: environmentalCount 
      },
      social: { 
        score: socialCount > 0 ? socialScore / socialCount : 0, 
        count: socialCount 
      },
      governance: { 
        score: governanceCount > 0 ? governanceScore / governanceCount : 0, 
        count: governanceCount 
      },
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your MetaMask wallet to view compliance reports.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading compliance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance & ESG Report</h1>
        <p className="text-gray-600">Comprehensive analysis of your trade compliance and sustainability metrics</p>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Compliance Score</h2>
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor(complianceScore)} mb-2`}>
            {Math.round(complianceScore)}%
          </div>
          <div className={`text-lg font-medium ${getScoreColor(complianceScore)}`}>
            {getScoreLabel(complianceScore)}
          </div>
          <p className="text-gray-600 mt-2">Based on {trades.length} trades</p>
        </div>
      </div>

      {/* ESG Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ESG Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Environmental */}
          <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Environmental</h3>
            <div className={`text-2xl font-bold ${getScoreColor(esgMetrics.environmental.score)}`}>
              {Math.round(esgMetrics.environmental.score)}%
            </div>
            <p className="text-sm text-green-700 mt-1">
              {esgMetrics.environmental.count} trades analyzed
            </p>
            <div className="mt-3 text-sm text-green-600">
              <div>• Carbon Footprint</div>
              <div>• Renewable Energy</div>
              <div>• Waste Management</div>
            </div>
          </div>

          {/* Social */}
          <div className="text-center p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Social</h3>
            <div className={`text-2xl font-bold ${getScoreColor(esgMetrics.social.score)}`}>
              {Math.round(esgMetrics.social.score)}%
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {esgMetrics.social.count} trades analyzed
            </p>
            <div className="mt-3 text-sm text-blue-600">
              <div>• Labor Standards</div>
              <div>• Community Impact</div>
              <div>• Diversity</div>
            </div>
          </div>

          {/* Governance */}
          <div className="text-center p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="text-3xl mb-2">⚖️</div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Governance</h3>
            <div className={`text-2xl font-bold ${getScoreColor(esgMetrics.governance.score)}`}>
              {Math.round(esgMetrics.governance.score)}%
            </div>
            <p className="text-sm text-purple-700 mt-1">
              {esgMetrics.governance.count} trades analyzed
            </p>
            <div className="mt-3 text-sm text-purple-600">
              <div>• Transparency</div>
              <div>• Compliance</div>
              <div>• Ethics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Trade Compliance Details</h2>
        </div>
        <div className="p-6">
          {trades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">No trades found for compliance analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => {
                let tradeEsgScore = 0;
                let tradeEsgData = {};
                
                try {
                  tradeEsgData = JSON.parse(trade.esgData);
                  const envScore = tradeEsgData.environmental ? 
                    (tradeEsgData.environmental.carbonFootprint + tradeEsgData.environmental.renewableEnergy + tradeEsgData.environmental.wasteManagement) / 3 : 0;
                  const socScore = tradeEsgData.social ? 
                    (tradeEsgData.social.laborStandards + tradeEsgData.social.communityImpact + tradeEsgData.social.diversity) / 3 : 0;
                  const govScore = tradeEsgData.governance ? 
                    (tradeEsgData.governance.transparency + tradeEsgData.governance.compliance + tradeEsgData.governance.ethics) / 3 : 0;
                  tradeEsgScore = (envScore + socScore + govScore) / 3;
                } catch (error) {
                  console.error('Error parsing ESG data for trade:', trade.id);
                }

                return (
                  <div key={trade.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Trade #{trade.id}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Value:</span>
                            <p className="font-medium">{trade.value} ETH</p>
                          </div>
                          <div>
                            <span className="text-gray-500">ESG Score:</span>
                            <p className={`font-medium ${getScoreColor(tradeEsgScore)}`}>
                              {Math.round(tradeEsgScore)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="font-medium">
                              {trade.status === 0 ? 'Created' : 
                               trade.status === 1 ? 'Funded' : 
                               trade.status === 2 ? 'In Transit' : 
                               trade.status === 3 ? 'Completed' : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Compliance:</span>
                            <p className={`font-medium ${getScoreColor(trade.status === 3 ? 100 : trade.status === 2 ? 75 : trade.status === 1 ? 50 : 25)}`}>
                              {trade.status === 3 ? '100%' : 
                               trade.status === 2 ? '75%' : 
                               trade.status === 1 ? '50%' : '25%'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">WTO & ESG Compliance Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">WTO Compliance</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Transparent trade documentation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Automated compliance checks
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Immutable audit trail
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Smart contract enforcement
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">ESG Standards</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Environmental impact tracking
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Social responsibility metrics
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Governance transparency
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sustainable trade practices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReport; 