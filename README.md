Chainlink Proxy Price Provider
==============================

[![ci](https://github.com/pinglamb/price-oracle-solidity/workflows/CI/badge.svg?branch=master)](https://github.com/pinglamb/price-oracle-solidity/actions)
[![codecov](https://codecov.io/gh/pinglamb/price-oracle-solidity/branch/master/graph/badge.svg?token=RXUFAL4T3R)](https://codecov.io/gh/pinglamb/price-oracle-solidity)

Implementation of using Chainlink as price oracle for getting ETH price of stored assets.

It is extracted from [Aave Protocol](https://github.com/aave/aave-protocol) with some changes.

## vs Aave Protocol

#### Upgrade to Solidity 0.6.11

The original implementation is base on Solidity 0.5. Main change is adding the `override` keyword.

#### Remove fallbackOracle

For Aave, when the price source is not set or price returned is <= 0, the call will be forwarded to a fallbackOracle
which is maintained by the Aave team. This mechanism is removed and instead the provider will revert the transaction.

Commit: https://github.com/pinglamb/price-oracle-solidity/commit/aa5cafcc0ec44bcdc8481ab1ca11805952a4dd58

#### Store ethAddress

Aave has a special native ETH address representation so if the asset to query is `ETH` itself, the provider will return
`1 ether`. This part is generalized and contract owner is allowed to set the `ethAddress`. For example, `WETH` address
can be used if the system is using that to wrap ETH.

Commit: https://github.com/pinglamb/price-oracle-solidity/commit/162c3e25066d1c24eadcadc6c1b678ad14f94887

#### getETHPriceInAsset

Aave always returns asset price in ETH. `getETHPriceInAsset` is added to find the reverse, which is calculated by taking
reciprocal of corresponding `getAssetPrice`. `DSMath` is added for proper decimal division (in `WAD`) (from
https://github.com/dapphub/ds-math).

This method is useful when you want to find the price of an asset in terms of another asset. Provided that both assets
ETH prices are available, you can:

```
toAmount = fromAmount * getAssetPrice(fromAsset) * getETHPriceInAsset(toAsset)
```

However, this method is returning the price in 18 decimal places regardless of decimals setting of the asset, to
calculate the result with decimals places respecting the ERC20 token setting, one might need to do the following:

```
toAmount = fromAmount
    .mul(getAssetPrice(address(fromAsset))     // Convert to proper ETH amount (18dp)
    .div(10**fromAsset.decimals())             // by dividing number of dp of fromAsset
    .wmul(getETHPriceInAsset(address(toAsset)) // wmul from ds-math, for 18dp * 18dp => 18dp
    .mul(10**toAsset.deciamls())               // Convert to proper toAsset amount
    .div(10**18)                               // by dividing number of dp of ETH
```

Commit: https://github.com/pinglamb/price-oracle-solidity/commit/b0b6bc8552e7d5f9713e972014d6aa188cc1c433

#### Test Cases

Unit tests are added to test the provider implementation against Chainlink Aggregator.

## License

MIT
