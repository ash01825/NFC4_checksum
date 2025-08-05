const { ethers } = require('ethers');
const tradeAgreementAbi = require('../../artifacts/contracts/TradeAgreement.sol/TradeAgreement.json').abi;
const identityRegistryAbi = require('../../artifacts/contracts/IdentityRegistry.sol/IdentityRegistry.json').abi;

// Load config from .env
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL;
const TRADE_AGREEMENT_ADDRESS = process.env.TRADE_AGREEMENT_CONTRACT_ADDRESS;
const IDENTITY_REGISTRY_ADDRESS = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS;

// Setup provider
let provider = null;
let tradeContract = null;
let identityContract = null;

if (RPC_URL && TRADE_AGREEMENT_ADDRESS && IDENTITY_REGISTRY_ADDRESS &&
    TRADE_AGREEMENT_ADDRESS !== "YOUR_DEPLOYED_TRADEAGREEMENT_ADDRESS" &&
    IDENTITY_REGISTRY_ADDRESS !== "YOUR_DEPLOYED_IDENTITYREGISTRY_ADDRESS") {

    try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
        tradeContract = new ethers.Contract(TRADE_AGREEMENT_ADDRESS, tradeAgreementAbi, provider);
        identityContract = new ethers.Contract(IDENTITY_REGISTRY_ADDRESS, identityRegistryAbi, provider);
        console.log("✅ Blockchain Service: Connected to contracts.");
    } catch (err) {
        console.warn("⚠️ Blockchain Service warning:", err.message);
    }
} else {
    console.warn("⚠️ Skipping blockchain contract setup – invalid or placeholder env vars.");
}

/**
 * Fetches details for a specific trade ID.
 * @param {string} tradeId - The ID of the trade.
 * @returns {Promise<object>} - The trade details.
 */
async function getTradeDetails(tradeId) {
    if (!tradeContract) {
        console.warn("❌ Cannot fetch trade – tradeContract not initialized.");
        return { error: "Contract not connected" };
    }

    try {
        const trade = await tradeContract.trades(tradeId);
        return {
            id: Number(trade.id),
            exporter: trade.exporter,
            importer: trade.importer,
            value: ethers.formatEther(trade.value),
            description: trade.description,
            esgData: trade.esgData,
            escrowVault: trade.escrowVault,
            status: Number(trade.status),
            latestShipmentUpdate: trade.latestShipmentUpdate,
        };
    } catch (error) {
        console.error(`Error fetching trade ${tradeId}:`, error);
        throw new Error("Could not fetch trade details.");
    }
}

/**
 * Fetches identity details for a specific address.
 * @param {string} address - The wallet address.
 * @returns {Promise<object>} - The participant's identity details.
 */
async function getIdentityDetails(address) {
    if (!identityContract) {
        console.warn("❌ Cannot fetch identity – identityContract not initialized.");
        return { error: "Contract not connected" };
    }

    try {
        const participant = await identityContract.participants(address);
        if (!participant.isVerified) {
            return { isVerified: false };
        }
        return {
            name: participant.name,
            role: participant.role,
            isVerified: participant.isVerified,
            registrationDate: new Date(Number(participant.registrationDate) * 1000).toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching identity for ${address}:`, error);
        throw new Error("Could not fetch identity details.");
    }
}

module.exports = {
    getTradeDetails,
    getIdentityDetails,
};