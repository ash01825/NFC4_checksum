const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Setting up frontend configuration...");
  
  // Get deployed contract addresses
  const deployments = require("../deployments/localhost");
  
  if (!deployments.TradeAgreement || !deployments.IdentityRegistry) {
    console.error("❌ Contracts not found. Please deploy contracts first:");
    console.error("   npx hardhat run deploy/01-deploy-trade-contracts.js --network localhost");
    return;
  }

  const tradeAgreementAddress = deployments.TradeAgreement.address;
  const identityRegistryAddress = deployments.IdentityRegistry.address;

  console.log("📄 Contract addresses found:");
  console.log("   TradeAgreement:", tradeAgreementAddress);
  console.log("   IdentityRegistry:", identityRegistryAddress);

  // Update frontend configuration
  const configPath = path.join(__dirname, "../frontend/src/config/contracts.js");
  let configContent = fs.readFileSync(configPath, "utf8");

  configContent = configContent.replace(
    /TRADE_AGREEMENT: "0x[a-fA-F0-9]{40}"/,
    `TRADE_AGREEMENT: "${tradeAgreementAddress}"`
  );
  
  configContent = configContent.replace(
    /IDENTITY_REGISTRY: "0x[a-fA-F0-9]{40}"/,
    `IDENTITY_REGISTRY: "${identityRegistryAddress}"`
  );

  fs.writeFileSync(configPath, configContent);
  console.log("✅ Frontend configuration updated!");

  // Register some test participants
  const [deployer, exporter, importer] = await ethers.getSigners();
  
  const IdentityRegistry = await ethers.getContractAt("IdentityRegistry", identityRegistryAddress);
  
  console.log("\n👥 Registering test participants...");
  
  try {
    // Register deployer as admin/exporter
    await IdentityRegistry.registerParticipant(
      deployer.address,
      "Platform Admin",
      "Admin"
    );
    console.log("✅ Registered Platform Admin:", deployer.address);
  } catch (error) {
    if (error.message.includes("ERR: ALREADY_REGISTERED")) {
      console.log("ℹ️  Platform Admin already registered");
    } else {
      console.error("❌ Error registering admin:", error.message);
    }
  }

  try {
    // Register test exporter
    await IdentityRegistry.registerParticipant(
      exporter.address,
      "Test Exporter Co.",
      "Exporter"
    );
    console.log("✅ Registered Test Exporter:", exporter.address);
  } catch (error) {
    if (error.message.includes("ERR: ALREADY_REGISTERED")) {
      console.log("ℹ️  Test Exporter already registered");
    } else {
      console.error("❌ Error registering exporter:", error.message);
    }
  }

  try {
    // Register test importer
    await IdentityRegistry.registerParticipant(
      importer.address,
      "Test Importer Inc.",
      "Importer"
    );
    console.log("✅ Registered Test Importer:", importer.address);
  } catch (error) {
    if (error.message.includes("ERR: ALREADY_REGISTERED")) {
      console.log("ℹ️  Test Importer already registered");
    } else {
      console.error("❌ Error registering importer:", error.message);
    }
  }

  console.log("\n🎉 Setup complete! You can now:");
  console.log("   1. Start the frontend: cd frontend && npm start");
  console.log("   2. Connect with MetaMask using these accounts:");
  console.log("      - Admin/Platform Owner:", deployer.address);
  console.log("      - Test Exporter:", exporter.address);
  console.log("      - Test Importer:", importer.address);
  console.log("\n💡 Import these private keys in MetaMask for testing:");
  console.log("   - Deployer private key: (check hardhat.config.js accounts)");
  console.log("   - Or use the mnemonic from hardhat node output");

  console.log("\n🔐 To add Hardhat network to MetaMask:");
  console.log("   - Network Name: Hardhat Local");
  console.log("   - RPC URL: http://127.0.0.1:8545");
  console.log("   - Chain ID: 31337");
  console.log("   - Currency Symbol: ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });