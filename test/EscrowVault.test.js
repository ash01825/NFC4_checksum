const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowVault Contract", function () {
    let EscrowVault, escrowVault;
    let tradeContract, beneficiary, funder, otherUser;

    beforeEach(async function () {
        [tradeContract, beneficiary, funder, otherUser] = await ethers.getSigners();

        // Deploy the EscrowVault with mock trade contract, beneficiary, and owner
        EscrowVault = await ethers.getContractFactory("EscrowVault");
        escrowVault = await EscrowVault.deploy(
            tradeContract.address,
            beneficiary.address,
            otherUser.address
        );
        await escrowVault.waitForDeployment();
    });

    describe("Funding", function () {
        it("Should accept ETH and update balance", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                funder.sendTransaction({
                    to: await escrowVault.getAddress(),
                    value: amount,
                })
            ).to.changeEtherBalances([escrowVault, funder], [amount, -amount]);

            expect(await escrowVault.getBalance()).to.equal(amount);
        });

        it("Should emit Deposited event on receiving funds", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                funder.sendTransaction({
                    to: await escrowVault.getAddress(),
                    value: amount,
                })
            )
                .to.emit(escrowVault, "Deposited")
                .withArgs(funder.address, amount);
        });
    });

    describe("Withdrawal", function () {
        const amount = ethers.parseEther("2.5");

        beforeEach(async function () {
            await funder.sendTransaction({
                to: await escrowVault.getAddress(),
                value: amount,
            });
        });

        it("Should allow authorized trade contract to withdraw funds", async function () {
            await expect(
                escrowVault.connect(tradeContract).withdraw()
            ).to.changeEtherBalances([escrowVault, beneficiary], [-amount, amount]);
        });

        it("Should emit Withdrawn event on successful withdrawal", async function () {
            await expect(
                escrowVault.connect(tradeContract).withdraw()
            )
                .to.emit(escrowVault, "Withdrawn")
                .withArgs(beneficiary.address, amount);
        });

        it("Should revert if caller is not the trade contract", async function () {
            await expect(
                escrowVault.connect(otherUser).withdraw()
            ).to.be.revertedWith("Caller is not the trade contract");

            await expect(
                escrowVault.connect(beneficiary).withdraw()
            ).to.be.revertedWith("Caller is not the trade contract");
        });

        it("Should revert withdrawal if vault is empty", async function () {
            await escrowVault.connect(tradeContract).withdraw();

            await expect(
                escrowVault.connect(tradeContract).withdraw()
            ).to.be.revertedWith("Vault is empty");
        });
    });
});