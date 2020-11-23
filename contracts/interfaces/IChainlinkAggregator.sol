// SPDX-License-Identifier: MIT

// Base on aave-protocol
// https://github.com/aave/aave-protocol/blob/e8d020e9752fbd4807a3b55f9cf98a88dcfb674dcontracts/interfaces/IChainlinkAggregator.sol
// Changes:
// - Upgrade to solidity 0.6.11

pragma solidity ^0.6.11;

interface IChainlinkAggregator {
    function latestAnswer() external view returns (int256);

    function latestTimestamp() external view returns (uint256);

    function latestRound() external view returns (uint256);

    function getAnswer(uint256 roundId) external view returns (int256);

    function getTimestamp(uint256 roundId) external view returns (uint256);

    event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 timestamp);
    event NewRound(uint256 indexed roundId, address indexed startedBy);
}
