// This is a deployment script for the hardhat-deploy plugin.
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("----------------------------------------------------");
    log("Deploying contracts with the account:", deployer);

    // 1. Deploy IdentityRegistry
    const identityRegistry = await deploy("IdentityRegistry", {
        from: deployer,
        args: [deployer], // The constructor argument is the initial owner
        log: true,
        waitConfirmations: 1,
    });

    log(`IdentityRegistry deployed at ${identityRegistry.address}`);
    log("----------------------------------------------------");

    // 2. Deploy TradeAgreement
    const tradeAgreementArgs = [identityRegistry.address]; // The constructor argument is the registry's address
    const tradeAgreement = await deploy("TradeAgreement", {
        from: deployer,
        args: tradeAgreementArgs,
        log: true,
        waitConfirmations: 1,
    });

    log(`TradeAgreement deployed at ${tradeAgreement.address}`);
    log("----------------------------------------------------");
    log("Deployment complete!");
};

module.exports.tags = ["all", "trade"];
