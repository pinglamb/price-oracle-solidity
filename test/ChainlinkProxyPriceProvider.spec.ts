import { accounts, contract } from '@openzeppelin/test-environment'
import { ether, expectRevert } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

const ChainlinkProxyPriceProvider = contract.fromArtifact('ChainlinkProxyPriceProvider')
const MockChainlinkAggregator = contract.fromArtifact('MockChainlinkAggregator')

describe('ChainlinkProxyPriceProvider', function () {
  const [owner, ...users] = accounts

  beforeEach(async function () {
    this.USDTAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    this.USDTETH = await MockChainlinkAggregator.new()
    // https://etherscan.io/address/0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46#readContract
    await this.USDTETH.setLatestAnswer('1677000000000000', '1606151568')

    this.LINKAddress = '0x514910771af9ca656af840dff83e8264ecf986ca'
    this.LINKETH = await MockChainlinkAggregator.new()
    // https://etherscan.io/address/0xDC530D9457755926550b59e8ECcdaE7624181557#readContract
    await this.LINKETH.setLatestAnswer('24967610000000000', '1606150638')

    this.DAIAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'

    this.provider = await ChainlinkProxyPriceProvider.new(
      [this.USDTAddress, this.LINKAddress],
      [this.USDTETH.address, this.LINKETH.address],
      { from: owner }
    )
  })

  describe('getAssetPrice', function () {
    it('gets an asset price by address', async function () {
      expect(await this.provider.getAssetPrice(this.USDTAddress)).to.be.bignumber.equal(ether('0.001677'))
      expect(await this.provider.getAssetPrice(this.LINKAddress)).to.be.bignumber.equal(ether('0.02496761'))
    })

    it('reverts if asset has no source', async function () {
      await expectRevert(this.provider.getAssetPrice(this.DAIAddress), 'SOURCE_IS_MISSING')
    })

    it('reverts if source is returning zero or negative price', async function () {
      await this.USDTETH.setLatestAnswer('0', '1606151568')
      await expectRevert(this.provider.getAssetPrice(this.USDTAddress), 'INVALID_PRICE')

      await this.LINKETH.setLatestAnswer('-1', '1606150638')
      await expectRevert(this.provider.getAssetPrice(this.LINKAddress), 'INVALID_PRICE')
    })
  })

  describe('getAssetsPrices', function () {
    it('gets a list of prices from a list of assets addresses', async function () {
      const prices = await this.provider.getAssetsPrices([this.USDTAddress, this.LINKAddress])
      expect(prices[0]).to.be.bignumber.equal(ether('0.001677'))
      expect(prices[1]).to.be.bignumber.equal(ether('0.02496761'))
    })

    it('reverts if any asset on the list has no source', async function () {
      await expectRevert(
        this.provider.getAssetsPrices([this.USDTAddress, this.LINKAddress, this.DAIAddress]),
        'SOURCE_IS_MISSING'
      )
    })

    it('reverts if any asset returns invalid price', async function () {
      await this.USDTETH.setLatestAnswer('0', '1606151568')
      await expectRevert(this.provider.getAssetsPrices([this.USDTAddress, this.LINKAddress]), 'INVALID_PRICE')
    })
  })

  describe('getSourceOfAsset', function () {
    it('gets the address of the source for an asset address', async function () {
      expect(await this.provider.getSourceOfAsset(this.USDTAddress)).to.equal(this.USDTETH.address)
      expect(await this.provider.getSourceOfAsset(this.LINKAddress)).to.equal(this.LINKETH.address)
    })
  })

  describe('transferOwnership', function () {
    it('restricts to only owner', async function () {
      await expectRevert(
        this.provider.transferOwnership(users[0], { from: users[0] }),
        'Ownable: caller is not the owner'
      )
    })
  })
})
