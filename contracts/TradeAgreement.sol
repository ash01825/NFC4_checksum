// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IdentityRegistry.sol";
import "./EscrowVault.sol";

/**
 * @title TradeAgreement
 * @notice Handles the lifecycle of a trade between verified participants using escrow.
 */
contract TradeAgreement {
    IdentityRegistry public identityRegistry;
    uint256 public tradeCounter;

    enum TradeStatus {
        Created,
        Funded,
        InTransit,
        Completed,
        Cancelled
    }

    struct Trade {
        uint256 id;
        address exporter;
        address importer;
        uint256 value;
        string description;
        string esgData;
        address escrowVault;
        TradeStatus status;
        string latestShipmentUpdate;
    }

    mapping(uint256 => Trade) public trades;

    /// @notice Emitted when a new trade is created
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed exporter,
        address indexed importer,
        uint256 value
    );

    /// @notice Emitted when a trade is funded by the importer
    event TradeFunded(uint256 indexed tradeId);

    /// @notice Emitted when shipment status is updated by the exporter
    event ShipmentUpdated(uint256 indexed tradeId, string newStatus);

    /// @notice Emitted when trade is completed and funds are released
    event TradeCompleted(uint256 indexed tradeId);

    /**
     * @param _registryAddress Address of the deployed IdentityRegistry contract
     */
    constructor(address _registryAddress) {
        require(_registryAddress != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_registryAddress);
    }

    /**
     * @notice Initiates a new trade
     * @param _importer Address of the importer
     * @param _value Trade value in wei
     * @param _description Description of goods
     * @param _esgData ESG metrics string
     */
    function createTrade(
        address _importer,
        uint256 _value,
        string memory _description,
        string memory _esgData
    ) external {
        require(identityRegistry.isVerified(msg.sender), "Exporter not verified");
        require(identityRegistry.isVerified(_importer), "Importer not verified");
        require(_value > 0, "Invalid trade value");

        tradeCounter++;
        uint256 tradeId = tradeCounter;

        EscrowVault newVault = new EscrowVault(
            address(this),
            msg.sender,
            msg.sender
        );

        trades[tradeId] = Trade({
            id: tradeId,
            exporter: msg.sender,
            importer: _importer,
            value: _value,
            description: _description,
            esgData: _esgData,
            escrowVault: address(newVault),
            status: TradeStatus.Created,
            latestShipmentUpdate: "Awaiting funding"
        });

        emit TradeCreated(tradeId, msg.sender, _importer, _value);
    }

    /**
     * @notice Allows importer to fund the trade
     * @param _tradeId Trade ID
     */
    function fundTrade(uint256 _tradeId) external payable {
        Trade storage trade = trades[_tradeId];

        require(trade.id != 0, "Trade not found");
        require(msg.sender == trade.importer, "Unauthorized");
        require(trade.status == TradeStatus.Created, "Invalid state");
        require(msg.value == trade.value, "Incorrect amount");

        (bool success, ) = trade.escrowVault.call{value: msg.value}("");
        require(success, "Transfer to vault failed");

        trade.status = TradeStatus.Funded;
        trade.latestShipmentUpdate = "Awaiting shipment";

        emit TradeFunded(_tradeId);
    }

    /**
     * @notice Allows exporter to update shipment status
     * @param _tradeId Trade ID
     * @param _newStatus New shipment status string
     */
    function updateShipmentStatus(uint256 _tradeId, string memory _newStatus) external {
        Trade storage trade = trades[_tradeId];

        require(msg.sender == trade.exporter, "Unauthorized");
        require(
            trade.status == TradeStatus.Funded || trade.status == TradeStatus.InTransit,
            "Invalid state"
        );

        trade.status = TradeStatus.InTransit;
        trade.latestShipmentUpdate = _newStatus;

        emit ShipmentUpdated(_tradeId, _newStatus);
    }

    /**
     * @notice Allows importer to confirm receipt and trigger fund release
     * @param _tradeId Trade ID
     */
    function confirmReceipt(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];

        require(msg.sender == trade.importer, "Unauthorized");
        require(
            trade.status == TradeStatus.Funded || trade.status == TradeStatus.InTransit,
            "Invalid state"
        );

        EscrowVault(payable(trade.escrowVault)).withdraw();

        trade.status = TradeStatus.Completed;

        emit TradeCompleted(_tradeId);
    }
}