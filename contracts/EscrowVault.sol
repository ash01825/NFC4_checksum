// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowVault
 * @notice Holds funds for a trade deal. Gets told what to do by the main agreement contract.
 * @dev Simple lockbox. It gets a payment, holds it, and only sends it to the
 * beneficiary when the main contract calls the withdraw function.
 */
contract EscrowVault is Ownable {
    // --- Events ---
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    // --- State ---

    // Address of the TradeAgreement that's in charge here.
    // immutable = set once, never changes. Cheaper and safer.
    address public immutable tradeContractAddr;

    // Who gets the money at the end. (The Exporter)
    address public payoutAddr;

    // --- Modifiers ---

    // A check to make sure only our TradeAgreement contract can tell this vault what to do.
    modifier onlyTradeContract() {
        require(
            msg.sender == tradeContractAddr,
            "Caller is not the trade contract"
        );
        _; // If check passes, run the rest of the function.
    }

    // --- Functions ---

    /**
     * @notice Sets up the vault for one specific trade.
     * @param _tradeContractAddr The address of the contract that will control this one.
     * @param _payoutAddr The address of the person who gets paid.
     * @param _ownerAddr The deployer's address.
     */
    constructor(
        address _tradeContractAddr,
        address _payoutAddr,
        address _ownerAddr
    ) Ownable(_ownerAddr) {
        require(_tradeContractAddr != address(0), "Bad trade contract address");
        require(_payoutAddr != address(0), "Bad payout address");

        tradeContractAddr = _tradeContractAddr;
        payoutAddr = _payoutAddr;
    }

    /**
     * @notice Simple getter to see how much money is locked up.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Releases the entire balance to the beneficiary.
     * @dev The main payout function. Protected by the onlyTradeContract modifier.
     */
    function withdraw() external onlyTradeContract {
        uint256 balance = address(this).balance;
        require(balance > 0, "Vault is empty");

        // Use the secure .call method to send the ETH.
        (bool success, ) = payable(payoutAddr).call{value: balance}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(payoutAddr, balance);
    }

    /**
     * @notice This special 'receive' function lets the contract accept ETH payments.
     * When the importer sends funds to this contract, this function catches them.
     */
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
