// Base on aave-protocol
// https://github.com/aave/aave-protocol/blob/e8d020e9752fbd4807a3b55f9cf98a88dcfb674d/contracts/misc/ChainlinkProxyPriceProvider.sol
// Changes:
// - Upgrade to solidity 0.6.11
// - Remove fallbackOracle

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

import '@openzeppelin/contracts/access/Ownable.sol';

import './interfaces/IPriceOracleGetter.sol';
import './interfaces/IChainlinkAggregator.sol';
import './libraries/EthAddressLib.sol';

/// @title ChainlinkProxyPriceProvider
/// @author Aave
/// @notice Proxy smart contract to get the price of an asset from a price source, with Chainlink Aggregator
///         smart contracts as primary option
/// - If the returned price by a Chainlink aggregator is <= 0, the transaction will be reverted
/// - Owned by the Aave governance system, allowed to add sources for assets, replace them
contract ChainlinkProxyPriceProvider is IPriceOracleGetter, Ownable {
    event AssetSourceUpdated(address indexed asset, address indexed source);

    mapping(address => IChainlinkAggregator) private assetsSources;

    /// @notice Constructor
    /// @param _assets The addresses of the assets
    /// @param _sources The address of the source of each asset
    constructor(address[] memory _assets, address[] memory _sources) public {
        internalSetAssetsSources(_assets, _sources);
    }

    /// @notice External function called by the Aave governance to set or replace sources of assets
    /// @param _assets The addresses of the assets
    /// @param _sources The address of the source of each asset
    function setAssetSources(address[] calldata _assets, address[] calldata _sources) external onlyOwner {
        internalSetAssetsSources(_assets, _sources);
    }

    /// @notice Internal function to set the sources for each asset
    /// @param _assets The addresses of the assets
    /// @param _sources The address of the source of each asset
    function internalSetAssetsSources(address[] memory _assets, address[] memory _sources) internal {
        require(_assets.length == _sources.length, 'INCONSISTENT_PARAMS_LENGTH');
        for (uint256 i = 0; i < _assets.length; i++) {
            assetsSources[_assets[i]] = IChainlinkAggregator(_sources[i]);
            emit AssetSourceUpdated(_assets[i], _sources[i]);
        }
    }

    /// @notice Gets an asset price by address
    /// @param _asset The asset address
    function getAssetPrice(address _asset) public view override returns (uint256) {
        IChainlinkAggregator source = assetsSources[_asset];
        if (_asset == EthAddressLib.ethAddress()) {
            return 1 ether;
        } else {
            // Require the asset has registered source
            require(address(source) != address(0), 'SOURCE_IS_MISSING');

            int256 _price = IChainlinkAggregator(source).latestAnswer();
            require(_price > 0, 'INVALID_PRICE');

            return uint256(_price);
        }
    }

    /// @notice Gets a list of prices from a list of assets addresses
    /// @param _assets The list of assets addresses
    function getAssetsPrices(address[] calldata _assets) external view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](_assets.length);
        for (uint256 i = 0; i < _assets.length; i++) {
            prices[i] = getAssetPrice(_assets[i]);
        }
        return prices;
    }

    /// @notice Gets the address of the source for an asset address
    /// @param _asset The address of the asset
    /// @return address The address of the source
    function getSourceOfAsset(address _asset) external view returns (address) {
        return address(assetsSources[_asset]);
    }
}
