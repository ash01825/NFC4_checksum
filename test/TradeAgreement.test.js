const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TradeAgreement Contract", function () {
    let TradeAgreement, tradeAgreement;
    let IdentityRegistry, identityRegistry;
    let deployer, exporter, importer, customs;

    // Fresh deployment before each test to ensure isolation
    beforeEach(async function () {
        [deployer, exporter, importer, customs] = await ethers.getSigners();

        IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
        identityRegistry = await IdentityRegistry.deploy(deployer.address);
        await identityRegistry.waitForDeployment();

        TradeAgreement = await ethers.getContractFactory("TradeAgreement");
        tradeAgreement = await TradeAgreement.deploy(await identityRegistry.getAddress());
        await tradeAgreement.waitForDeployment();

        // Register test participants
        await identityRegistry.connect(deployer).registerParticipant(exporter.address, "Surat Silks", "Exporter");
        await identityRegistry.connect(deployer).registerParticipant(importer.address, "Milan Vogue", "Importer");
    });

    it("Should create a new trade successfully", async function () {
        const tradeValue = ethers.parseEther("1.0");

        await tradeAgreement.connect(exporter).createTrade(
            importer.address,
            tradeValue,
            "1000 units of Organic Cotton",
            "Certified Organic, Low Water Usage"
        );

        expect(await tradeAgreement.tradeCounter()).to.equal(1);

        const trade = await tradeAgreement.trades(1);
        expect(trade.id).to.equal(1);
        expect(trade.exporter).to.equal(exporter.address);
        expect(trade.importer).to.equal(importer.address);
        expect(trade.value).to.equal(tradeValue);
        expect(trade.status).to.equal(0); // Created
    });

    it("Should fail to create a trade if the importer is not verified", async function () {
        const tradeValue = ethers.parseEther("1.0");

        await expect(
            tradeAgreement.connect(exporter).createTrade(
                customs.address, // Unverified address
                tradeValue,
                "Test Goods",
                "Test ESG"
            )
        ).to.be.revertedWith("Importer not verified");
    });

    it("Should emit TradeCreated event when a trade is created", async function () {
        const tradeValue = ethers.parseEther("1.0");

        await expect(
            tradeAgreement.connect(exporter).createTrade(
                importer.address,
                tradeValue,
                "Goods",
                "ESG"
            )
        ).to.emit(tradeAgreement, "TradeCreated")
            .withArgs(1, exporter.address, importer.address, tradeValue);
    });

    it("Should allow the full trade lifecycle to complete", async function () {
        const tradeValue = ethers.parseEther("2.0");

        // 1. Create trade
        await tradeAgreement.connect(exporter).createTrade(importer.address, tradeValue, "Goods", "ESG");

        // 2. Fund trade
        await tradeAgreement.connect(importer).fundTrade(1, { value: tradeValue });
        let trade = await tradeAgreement.trades(1);
        expect(trade.status).to.equal(1); // Funded

        // 3. Update shipment
        await tradeAgreement.connect(exporter).updateShipmentStatus(1, "In Transit");
        trade = await tradeAgreement.trades(1);
        expect(trade.status).to.equal(2); // InTransit
        expect(trade.latestShipmentUpdate).to.equal("In Transit");

        // 4. Confirm receipt and check payout
        const balanceBefore = await ethers.provider.getBalance(exporter.address);
        const tx = await tradeAgreement.connect(importer).confirmReceipt(1);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;

        trade = await tradeAgreement.trades(1);
        expect(trade.status).to.equal(3); // Completed

        const balanceAfter = await ethers.provider.getBalance(exporter.address);
        expect(balanceAfter).to.equal(balanceBefore + tradeValue);
    });
});