// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// We need to import the other contracts to use them
import "./IdentityRegistry.sol";
import "./EscrowVault.sol";

/**
 * @title TradeAgreement
 * @notice The main contract that manages the entire trade lifecycle.
 * @dev This is the core logic. It creates trades, links to an escrow vault,
 */
contract TradeAgreement {

    IdentityRegistry public identityRegistry;

    uint256 public tradeCounter;

    // An enum to define the possible states of a trade.
    enum TradeStatus {
        Created,
        Funded,
        InTransit,
        Completed,
        Cancelled
    }

    // A struct to hold all the details for a single trade.
    struct Trade {
        uint256 id;
        address exporter;
        address importer;
        uint256 value; // Price of the goods in wei
        string description;
        string esgData;
        address escrowVault;
        TradeStatus status;
        string latestShipmentUpdate;
    }

    mapping(uint256 => Trade) public trades;

    // --- Events ---
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed exporter,
        address indexed importer,
        uint256 value
    );
    event TradeFunded(uint256 indexed tradeId);
    event ShipmentUpdated(uint256 indexed tradeId, string newStatus);
    event TradeCompleted(uint256 indexed tradeId);

    // --- Constructor ---
    /**
     * @notice Sets up the contract by linking it to the deployed IdentityRegistry.
     * @param _registryAddress The address of the IdentityRegistry contract.
     */
    constructor(address _registryAddress) {
        require(_registryAddress != address(0), "Bad registry address");
        identityRegistry = IdentityRegistry(_registryAddress);
    }

    // --- Core Functions ---

    /**
     * @notice Creates a new trade agreement. Called by the exporter.
     * @param _importer The address of the importing party.
     * @param _value The price of the goods in wei (the smallest unit of Ether).
     * @param _description A description of the goods.
     * @param _esgData Self-declared ESG metrics for the trade.
     */
    function createTrade(
        address _importer,
        uint256 _value,
        string memory _description,
        string memory _esgData
    ) external {
        // Check that both parties are registered in our identity system.
        require(identityRegistry.isVerified(msg.sender), "Exporter not verified");
        require(identityRegistry.isVerified(_importer), "Importer not verified");
        require(_value > 0, "Value must be greater than zero");

        tradeCounter++;
        uint256 currentTradeId = tradeCounter;

        EscrowVault newVault = new EscrowVault(
            address(this), // This contract is the controller
            msg.sender, // The exporter is the beneficiary
            msg.sender // The exporter is the initial owner of the vault contract
        );

        // Store the new trade's details.
        trades[currentTradeId] = Trade({
            id: currentTradeId,
            exporter: msg.sender,
            importer: _importer,
            value: _value,
            description: _description,
            esgData: _esgData,
            escrowVault: address(newVault), // Store the new vault's address
            status: TradeStatus.Created,
            latestShipmentUpdate: "Awaiting funding"
        });

        emit TradeCreated(currentTradeId, msg.sender, _importer, _value);
    }

    /**
     * @notice Funds a trade. Called by the importer.
     * @param _tradeId The ID of the trade to fund.
     */
    function fundTrade(uint256 _tradeId) external payable {
        Trade storage currentTrade = trades[_tradeId];

        // Security checks
        require(currentTrade.id != 0, "Trade does not exist");
        require(msg.sender == currentTrade.importer, "Not the importer");
        require(currentTrade.status == TradeStatus.Created, "Trade not ready for funding");
        require(msg.value == currentTrade.value, "Incorrect payment amount");

        // Forward the payment to the escrow vault.
        (bool success, ) = currentTrade.escrowVault.call{value: msg.value}("");
        require(success, "Funding transfer failed");

        // Update state
        currentTrade.status = TradeStatus.Funded;
        currentTrade.latestShipmentUpdate = "Awaiting shipment";
        emit TradeFunded(_tradeId);
    }

    /**
     * @notice Updates the shipment status. Called by the exporter.
     * @param _tradeId The ID of the trade.
     * @param _newStatus A string describing the new status, e.g., "In Transit".
     */
    function updateShipmentStatus(uint256 _tradeId, string memory _newStatus) external {
        Trade storage currentTrade = trades[_tradeId];
        require(msg.sender == currentTrade.exporter, "Not the exporter");
        require(currentTrade.status == TradeStatus.Funded || currentTrade.status == TradeStatus.InTransit, "Trade not in a valid state for update");

        currentTrade.status = TradeStatus.InTransit;
        currentTrade.latestShipmentUpdate = _newStatus;
        emit ShipmentUpdated(_tradeId, _newStatus);
    }

    /**
     * @notice Confirms receipt of goods. Called by the importer. This triggers the payout.
     * @param _tradeId The ID of the trade to complete.
     */
    function confirmReceipt(uint256 _tradeId) external {
        Trade storage currentTrade = trades[_tradeId];
        require(msg.sender == currentTrade.importer, "Not the importer");
        require(currentTrade.status == TradeStatus.InTransit || currentTrade.status == TradeStatus.Funded, "Trade not in transit or funded");

        EscrowVault(payable(currentTrade.escrowVault)).withdraw();

        currentTrade.status = TradeStatus.Completed;
        emit TradeCompleted(_tradeId);
    }
}
