// SPDX-License-Identifier: MIT

import '../interfaces/IChainlinkAggregator.sol';

pragma solidity 0.6.11;

contract MockChainlinkAggregator is IChainlinkAggregator {
    int256 private _latestAnswer;
    uint256 private _latestTimestamp;

    function setLatestAnswer(int256 latestAnswer, uint256 latestTimestamp) external {
        _latestAnswer = latestAnswer;
        _latestTimestamp = latestTimestamp;
    }

    function latestAnswer() external view override returns (int256) {
        return _latestAnswer;
    }

    function latestTimestamp() external view override returns (uint256) {
        return _latestTimestamp;
    }

    function latestRound() external view override returns (uint256) {
        return _latestTimestamp;
    }

    function getAnswer(uint256) external view override returns (int256) {
        return _latestAnswer;
    }

    function getTimestamp(uint256) external view override returns (uint256) {
        return _latestTimestamp;
    }
}
