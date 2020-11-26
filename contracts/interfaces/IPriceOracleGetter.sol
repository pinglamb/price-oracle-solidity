// SPDX-License-Identifier: MIT

// Base on aave-protocol
// https://github.com/aave/aave-protocol/blob/e8d020e97/contracts/interfaces/IPriceOracleGetter.sol
// Changes:
// - Upgrade to solidity 0.6.11

pragma solidity ^0.6.11;

/************
@title IPriceOracleGetter interface
@notice Interface for the price oracle.*/
interface IPriceOracleGetter {
    /***********
    @dev returns the asset price in ETH
     */
    function getAssetPrice(address _asset) external view returns (uint256);

    /***********
    @dev returns the ETH price in asset
     */
    function getETHPriceInAsset(address _asset) external view returns (uint256);
}
