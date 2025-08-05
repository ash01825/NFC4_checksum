// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistry
 * @notice Manages participant identities for the trade platform.
 * @dev Maps wallet addresses to roles and verified status. Owner-controlled for registrations.
 */
contract IdentityRegistry is Ownable {
    // Event for new participant registration
    event ParticipantRegistered(
        address indexed participantAddr,
        string indexed role,
        string name
    );

    // Event for a change in verification status
    event ParticipantVerified(address indexed participantAddr, bool isVerified);

    // Holds data for each registered entity
    struct Participant {
        string name; // e.g., "Surat Silks"
        string role; // e.g., "Exporter", "Importer"
        bool isVerified;
        uint256 registrationDate;
    }

    // Main lookup: address -> Participant data
    mapping(address => Participant) public participants;

    // Sets the initial owner upon deployment
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Adds a new participant to the registry.
     * @dev Only the contract owner can call this. New participants are verified by default for hackathon purposes.
     * @param _addr The wallet address of the new participant.
     * @param _name The business name of the participant.
     * @param _role The participant's role, e.g., "Exporter".
     */
    function registerParticipant(
        address _addr,
        string memory _name,
        string memory _role
    ) external onlyOwner {
        // Basic validation checks
        require(_addr != address(0), "ERR: ZERO_ADDRESS");
        require(
            bytes(participants[_addr].name).length == 0,
            "ERR: ALREADY_REGISTERED"
        );

        // Add to mapping
        participants[_addr] = Participant({
            name: _name,
            role: _role,
            isVerified: true, // Auto-verified for the demo
            registrationDate: block.timestamp
        });

        // Announce the registration
        emit ParticipantRegistered(_addr, _role, _name);
        emit ParticipantVerified(_addr, true);
    }

    /**
     * @notice Checks if an address is registered and marked as verified.
     * @param _addr The address to check.
     * @return bool True if verified, false otherwise.
     */
    function isVerified(address _addr) external view returns (bool) {
        return participants[_addr].isVerified;
    }

    /**
     * @notice Fetches the role for a given address.
     * @param _addr The address to check.
     * @return The participant's role as a string.
     */
    function getRole(address _addr) external view returns (string memory) {
        require(
            bytes(participants[_addr].role).length > 0,
            "ERR: NOT_REGISTERED"
        );
        return participants[_addr].role;
    }
}