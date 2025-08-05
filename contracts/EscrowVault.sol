// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowVault
 * @notice Simple vault to hold funds for a trade. Controlled by TradeAgreement.
 * @dev ETH is held until explicitly released to the exporter by the main contract.
 */
contract EscrowVault is Ownable {
    // --- Events ---
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    // --- State ---
    address public immutable tradeContractAddr; // Authorized controller (TradeAgreement)
    address public payoutAddr;                  // Recipient (exporter)

    // --- Modifiers ---
    modifier onlyTradeContract() {
        require(msg.sender == tradeContractAddr, "Caller is not the trade contract");
        _;
    }

    /**
     * @notice Initializes the vault for a single trade.
     * @param _tradeContractAddr The authorized contract (TradeAgreement).
     * @param _payoutAddr Final recipient of the funds (exporter).
     * @param _ownerAddr Owner (used for OpenZeppelin Ownable setup).
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
     * @notice Returns the vault’s current balance.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Transfers all funds to the exporter.
     * @dev Callable only by the authorized trade contract.
     */
    function withdraw() external onlyTradeContract {
        uint256 balance = address(this).balance;
        require(balance > 0, "Vault is empty");

        (bool success, ) = payable(payoutAddr).call{value: balance}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(payoutAddr, balance);
    }

    /**
     * @notice Accepts ETH deposits.
     */
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}