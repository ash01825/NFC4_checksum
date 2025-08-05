const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
    console.log("🌱 Seeding the blockchain with initial data...");

    // Get the accounts you named in your hardhat.config.js
    const { deployer, exporter, importer } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    const exporterSigner = await ethers.getSigner(exporter);

    // Get your already-deployed contracts using the 'deployments' object
    const identityRegistryDeployment = await deployments.get("IdentityRegistry");
    const identityRegistry = await ethers.getContractAt("IdentityRegistry", identityRegistryDeployment.address, deployerSigner);

    const tradeAgreementDeployment = await deployments.get("TradeAgreement");
    const tradeAgreement = await ethers.getContractAt("TradeAgreement", tradeAgreementDeployment.address, exporterSigner);


    console.log(`Using IdentityRegistry at: ${await identityRegistry.getAddress()}`);
    console.log(`Using TradeAgreement at: ${await tradeAgreement.getAddress()}`);

    // 1. Register the exporter and importer
    console.log("Registering participants...");
    await (await identityRegistry.registerParticipant(exporter, "Surat Silks", "Exporter")).wait();
    await (await identityRegistry.registerParticipant(importer, "Milan Vogue", "Importer")).wait();
    console.log("✅ Participants registered.");

    // 2. Create a trade from the exporter
    console.log("Creating a sample trade...");
    const tradeValue = ethers.parseEther("1.5"); // 1.5 ETH
    await (await tradeAgreement.createTrade(
        importer,
        tradeValue,
        "500 Rolls of Premium Silk",
        "GOTS Certified, Fair Trade"
    )).wait();
    console.log("✅ Sample trade created with ID: 1");
    console.log("🌱 Seeding complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
