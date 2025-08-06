# 🚀 TradeTrust Frontend Setup Guide

This guide will help you set up the complete TradeTrust frontend with proper smart contract integration.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask browser extension
- Git

## 🛠️ Complete Setup Process

### Step 1: Start Hardhat Network

Open a terminal in your project root and start the local blockchain:

```bash
npx hardhat node
```

Keep this terminal running. You should see account addresses and private keys displayed.

### Step 2: Deploy Contracts and Setup Frontend

In a new terminal, run the automated setup:

```bash
npm run deploy
npm run setup-frontend
```

This will:
- Deploy all smart contracts
- Update frontend configuration with contract addresses
- Register test participants (admin, exporter, importer)

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 4: Start the Frontend

```bash
npm start
```

The application will open at `http://localhost:3000`

### Step 5: Configure MetaMask

1. **Add Hardhat Network to MetaMask:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Accounts:**
   - Copy private keys from the hardhat node terminal
   - Import them into MetaMask as new accounts
   - You'll have access to accounts with different roles

## 👥 User Roles and Registration

### Automatic Registration Process

The platform now supports automatic user registration in two ways:

1. **Self-Registration (if you're the contract owner):**
   - Connect your wallet
   - Fill out the registration form
   - Submit directly to the blockchain

2. **Admin Registration:**
   - If you're the contract owner, you'll see an Admin Panel
   - Register other users by entering their wallet addresses
   - Assign roles (Exporter/Importer)

### Pre-configured Test Accounts

The setup script creates these test accounts:

- **Account #0**: Platform Admin/Owner
- **Account #1**: Test Exporter Company
- **Account #2**: Test Importer Inc.

## 🔄 User Flow

### For New Users:
1. Connect MetaMask wallet
2. If not registered, see registration form
3. Fill out company details and role
4. Submit registration (or request admin approval)
5. Access platform features based on role

### For Exporters:
1. ✅ Create new trade agreements
2. ✅ Update shipment status
3. ✅ View trade history
4. ✅ Monitor compliance scores

### For Importers:
1. ✅ Fund pending trades
2. ✅ Confirm receipt of goods
3. ✅ View trade history
4. ✅ Track shipment updates

### For Admins:
1. ✅ Register new participants
2. ✅ Manage user roles
3. ✅ Platform oversight

## 🎯 Key Features Working

### ✅ Smart Contract Integration
- Real-time blockchain data reading
- Transaction signing and submission
- Event listening and updates
- Error handling and user feedback

### ✅ Identity Management
- Automatic user verification
- Role-based access control
- Registration workflow
- Admin panel for user management

### ✅ Trade Management
- Create trades (exporters)
- Fund trades (importers)
- Status updates (exporters)
- Completion flow (importers)

### ✅ ESG & Compliance
- ESG metrics tracking
- Compliance scoring
- WTO standards adherence
- Detailed reporting

## 🔧 Troubleshooting

### Common Issues & Solutions

1. **"Contract not found" errors:**
   ```bash
   # Redeploy contracts
   npm run deploy
   npm run setup-frontend
   ```

2. **"User not verified" errors:**
   - Use the registration form
   - Or ask admin to register your address
   - Check that you're using the correct MetaMask account

3. **MetaMask connection issues:**
   - Ensure Hardhat network is added
   - Check you're on Chain ID 31337
   - Refresh the page and reconnect

4. **Transaction failures:**
   - Ensure sufficient ETH balance
   - Check gas settings in MetaMask
   - Verify you have the correct role for the action

### Debug Commands

```bash
# Check contract deployments
npx hardhat console --network localhost

# Verify user registration
const registry = await ethers.getContractAt("IdentityRegistry", "CONTRACT_ADDRESS");
await registry.isVerified("USER_ADDRESS");
await registry.getRole("USER_ADDRESS");

# Check trade contract
const trades = await ethers.getContractAt("TradeAgreement", "CONTRACT_ADDRESS");
await trades.tradeCounter();
```

## 📱 Frontend Features

### Dashboard
- Wallet information and balance
- User verification status
- Trade overview
- Quick actions
- Admin panel (for owners)

### Create Trade
- Trade details form
- ESG metrics input
- Smart contract integration
- Role-based access

### Trade Details
- Complete trade information
- Interactive action buttons
- Status tracking
- Real-time updates

### Compliance Report
- Overall compliance scoring
- ESG metrics breakdown
- Individual trade analysis
- WTO standards compliance

## 🔐 Security Notes

- Never share private keys
- Use test accounts for development
- Verify contract addresses before transactions
- Always check transaction details in MetaMask

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ Wallet connects successfully
2. ✅ User verification status displays
3. ✅ Trade creation works (for exporters)
4. ✅ Trade funding works (for importers)
5. ✅ Status updates work in real-time
6. ✅ Compliance reports generate
7. ✅ Admin panel appears (for contract owner)

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Hardhat node is running
3. Ensure contracts are deployed
4. Check MetaMask network settings
5. Verify account roles and permissions

The frontend is now fully integrated with your smart contracts and ready for the hackathon! 🎯