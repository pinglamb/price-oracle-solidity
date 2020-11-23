// Base on aave-protocol
// https://github.com/aave/aave-protocol/blob/e8d020e9752fbd4807a3b55f9cf98a88dcfb674d/contracts/interfaces/IPriceOracle.sol
// Changes:
// - Upgrade to solidity 0.6.11

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

/************
@title IPriceOracle interface
@notice Interface for the Aave price oracle.*/
interface IPriceOracle {
    /***********
    @dev returns the asset price in ETH
     */
    function getAssetPrice(address _asset) external view returns (uint256);

    /***********
    @dev sets the asset price, in wei
     */
    function setAssetPrice(address _asset, uint256 _price) external;
}
