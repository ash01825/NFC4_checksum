// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistry
 * @notice Maintains participant identities for the trade platform.
 * @dev Admin-only registration. Maps addresses to participant metadata and verified status.
 */
contract IdentityRegistry is Ownable {
    /// @notice Emitted when a new participant is registered
    event ParticipantRegistered(
        address indexed participantAddr,
        string indexed role,
        string name
    );

    /// @notice Emitted when a participant is verified
    event ParticipantVerified(address indexed participantAddr, bool isVerified);

    struct Participant {
        string name;
        string role;
        bool isVerified;
        uint256 registrationDate;
    }

    mapping(address => Participant) public participants;

    /**
     * @notice Constructor to set initial contract owner.
     * @param initialOwner Address of the contract deployer/owner.
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Registers a new participant. Only callable by the owner.
     * @param _addr Wallet address of the participant.
     * @param _name Business name of the participant.
     * @param _role Role string (e.g., "Exporter", "Importer").
     */
    function registerParticipant(
        address _addr,
        string memory _name,
        string memory _role
    ) external onlyOwner {
        require(_addr != address(0), "ERR: ZERO_ADDRESS");
        require(bytes(participants[_addr].name).length == 0, "ERR: ALREADY_REGISTERED");

        participants[_addr] = Participant({
            name: _name,
            role: _role,
            isVerified: true,
            registrationDate: block.timestamp
        });

        emit ParticipantRegistered(_addr, _role, _name);
        emit ParticipantVerified(_addr, true);
    }

    /**
     * @notice Checks if a participant is verified.
     * @param _addr Address to check.
     * @return True if verified, false otherwise.
     */
    function isVerified(address _addr) external view returns (bool) {
        return participants[_addr].isVerified;
    }

    /**
     * @notice Gets the registered role of a participant.
     * @param _addr Address to query.
     * @return Role string (e.g., "Exporter").
     */
    function getRole(address _addr) external view returns (string memory) {
        require(bytes(participants[_addr].role).length > 0, "ERR: NOT_REGISTERED");
        return participants[_addr].role;
    }
}