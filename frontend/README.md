# TradeTrust Frontend

A React-based frontend for the NFC4 TradeTrust platform - a blockchain-based cross-border trade solution with WTO compliance and ESG tracking.

## Features

- 🔗 **MetaMask Wallet Integration** - Connect your wallet to interact with smart contracts
- 📊 **Dashboard** - View your trades, wallet info, and quick actions
- ➕ **Create Trades** - Exporters can create new trade agreements
- 📋 **Trade Management** - Fund, update status, and complete trades
- 📈 **Compliance & ESG Reports** - Track WTO compliance and sustainability metrics
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Hardhat local network running
- Smart contracts deployed

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Contract Addresses

Update the contract addresses in `src/config/contracts.js` with your deployed contract addresses:

```javascript
export const CONTRACT_ADDRESSES = {
  TRADE_AGREEMENT: "YOUR_DEPLOYED_TRADE_AGREEMENT_ADDRESS",
  IDENTITY_REGISTRY: "YOUR_DEPLOYED_IDENTITY_REGISTRY_ADDRESS",
};
```

### 3. Start Hardhat Network

In your project root, start the Hardhat local network:

```bash
npx hardhat node
```

### 4. Deploy Contracts

Deploy your smart contracts and note the addresses:

```bash
npx hardhat run deploy/01-deploy-trade-contracts.js --network localhost
```

### 5. Register Participants

Use the Hardhat console or a script to register participants in the IdentityRegistry:

```javascript
// Example: Register an exporter
await identityRegistry.registerParticipant(
  "EXPORTER_ADDRESS",
  "Exporter Company Name",
  "Exporter"
);

// Example: Register an importer
await identityRegistry.registerParticipant(
  "IMPORTER_ADDRESS", 
  "Importer Company Name",
  "Importer"
);
```

### 6. Start the Frontend

```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage Guide

### Connecting Wallet

1. Click the "Connect Wallet" button in the header
2. Select MetaMask from the wallet options
3. Approve the connection in MetaMask
4. Ensure you're connected to the Hardhat network (Chain ID: 31337)

### Creating a Trade (Exporters Only)

1. Navigate to "Create Trade" from the dashboard
2. Enter the importer's wallet address
3. Specify the trade value in ETH
4. Add a description of the goods/services
5. Include ESG metrics in JSON format
6. Submit the transaction

### Managing Trades

#### For Importers:
- **Fund Trade**: Send ETH to fund a created trade
- **Confirm Receipt**: Complete the trade after receiving goods

#### For Exporters:
- **Update Status**: Provide shipment updates during transit

### Viewing Compliance Reports

1. Navigate to "Compliance & ESG" from the dashboard
2. View overall compliance scores
3. Analyze ESG performance metrics
4. Review individual trade compliance details

## Smart Contract Integration

The frontend integrates with three main smart contracts:

### TradeAgreement Contract
- Create new trades
- Fund trades with ETH
- Update shipment status
- Confirm receipt and complete trades

### IdentityRegistry Contract
- Verify participant identities
- Check user roles (Exporter/Importer)
- Ensure only verified participants can trade

### EscrowVault Contract
- Secure fund holding during trade lifecycle
- Automatic fund release upon trade completion

## ESG Metrics Structure

The platform tracks ESG metrics in JSON format:

```json
{
  "environmental": {
    "carbonFootprint": 85,
    "renewableEnergy": 90,
    "wasteManagement": 75
  },
  "social": {
    "laborStandards": 95,
    "communityImpact": 80,
    "diversity": 85
  },
  "governance": {
    "transparency": 90,
    "compliance": 95,
    "ethics": 88
  }
}
```

## Network Configuration

The frontend is configured for Hardhat local network:

- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Currency**: ETH

## Troubleshooting

### Common Issues

1. **"Contract not found" errors**
   - Ensure contracts are deployed
   - Verify contract addresses in config
   - Check network connection

2. **"User not verified" errors**
   - Register your address in IdentityRegistry
   - Ensure you have the correct role (Exporter/Importer)

3. **MetaMask connection issues**
   - Add Hardhat network to MetaMask
   - Import test accounts with private keys
   - Ensure sufficient ETH balance

4. **Transaction failures**
   - Check gas limits
   - Verify sufficient ETH for transactions
   - Ensure correct function parameters

### Development Tips

- Use browser console for debugging
- Check MetaMask transaction history
- Monitor Hardhat network logs
- Use Hardhat console for contract interactions

## File Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── CreateTrade.jsx
│   │   ├── TradeDetails.jsx
│   │   ├── ComplianceReport.jsx
│   │   └── Navigation.jsx
│   ├── config/
│   │   └── contracts.js
│   ├── contracts/
│   │   └── abi/
│   │       ├── TradeAgreement.json
│   │       └── IdentityRegistry.json
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Contributing

1. Follow the existing code style
2. Test all functionality thoroughly
3. Update documentation as needed
4. Ensure smart contract compatibility

## License

This project is part of the NFC4 TradeTrust platform for secure cross-border trade.
