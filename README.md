Chainlink Proxy Price Provider
==============================

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

#### Test Cases

Unit tests are added to test the provider implementation against Chainlink Aggregator.

## License

MIT
