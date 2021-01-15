import { artifacts, web3 } from 'hardhat'
import { ether, expectRevert, constants } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

const ChainlinkProxyPriceProvider = artifacts.require('ChainlinkProxyPriceProvider')
const MockChainlinkAggregator = artifacts.require('MockChainlinkAggregator')

describe('ChainlinkProxyPriceProvider', function () {
  let owner, users

  beforeEach(async function () {
    const [first, ...rest] = await web3.eth.getAccounts()
    owner = first
    users = rest
  })

  beforeEach(async function () {
    this.USDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    this.USDTETH = await MockChainlinkAggregator.new()
    // https://etherscan.io/address/0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46#readContract
    await this.USDTETH.setLatestAnswer('1677000000000000', '1606151568')

    this.LINKAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA'
    this.LINKETH = await MockChainlinkAggregator.new()
    // https://etherscan.io/address/0xDC530D9457755926550b59e8ECcdaE7624181557#readContract
    await this.LINKETH.setLatestAnswer('24967610000000000', '1606150638')

    this.DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    this.WETHAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

    this.provider = await ChainlinkProxyPriceProvider.new(
      [this.USDTAddress, this.LINKAddress],
      [this.USDTETH.address, this.LINKETH.address],
      { from: owner }
    )
    await this.provider.setETHAddress(this.WETHAddress, { from: owner })
  })

  describe('getAssetPrice', function () {
    it('gets an asset price by address', async function () {
      expect(await this.provider.getAssetPrice(this.USDTAddress)).to.be.bignumber.equal(ether('0.001677'))
      expect(await this.provider.getAssetPrice(this.LINKAddress)).to.be.bignumber.equal(ether('0.02496761'))
    })

    it('returns 1 ether if the eth address is provided', async function () {
      expect(await this.provider.getAssetPrice(this.WETHAddress)).to.be.bignumber.equal(ether('1'))
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

  describe('getETHPriceInAsset', function () {
    it('gets ETH price in terms of asset', async function () {
      expect(await this.provider.getETHPriceInAsset(this.USDTAddress)).to.be.bignumber.equal(
        ether('596.302921884317233154')
      )
      expect(await this.provider.getETHPriceInAsset(this.LINKAddress)).to.be.bignumber.equal(
        ether('40.051891230277948110')
      )
    })

    it('returns 1 ether if the eth address is provided', async function () {
      expect(await this.provider.getETHPriceInAsset(this.WETHAddress)).to.be.bignumber.equal(ether('1'))
    })

    it('reverts if calculated price is zero', async function () {
      // For some reason the price oracle returns a huge number, e.g. 10 ** 19
      await this.USDTETH.setLatestAnswer(ether('10000000000000000000'), '1606151568')
      await expectRevert(this.provider.getETHPriceInAsset(this.USDTAddress), 'INVALID_PRICE')
    })

    it('reverts if source of asset price is returning zero or negative number', async function () {
      await this.USDTETH.setLatestAnswer('0', '1606151568')
      await expectRevert(this.provider.getETHPriceInAsset(this.USDTAddress), 'INVALID_PRICE')

      await this.LINKETH.setLatestAnswer('-1', '1606150638')
      await expectRevert(this.provider.getETHPriceInAsset(this.LINKAddress), 'INVALID_PRICE')
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

  describe('setAssetSources', function () {
    it('sets or replaces sources of assets', async function () {
      await this.provider.setAssetSources(
        [this.USDTAddress, this.DAIAddress],
        [this.LINKETH.address, this.USDTETH.address],
        { from: owner }
      )

      expect(await this.provider.getSourceOfAsset(this.USDTAddress)).to.equal(this.LINKETH.address)
      expect(await this.provider.getSourceOfAsset(this.LINKAddress)).to.equal(this.LINKETH.address)
      expect(await this.provider.getSourceOfAsset(this.DAIAddress)).to.equal(this.USDTETH.address)
    })

    it('reverts if the array length does not match', async function () {
      await expectRevert(
        this.provider.setAssetSources([this.USDTAddress, this.LINKAddress], [this.USDTETH.address], { from: owner }),
        'INCONSISTENT_PARAMS_LENGTH'
      )
    })

    it('restricts to only owner', async function () {
      await expectRevert(this.provider.setAssetSources([], [], { from: users[0] }), 'Ownable: caller is not the owner')
    })
  })

  describe('getSourceOfAsset', function () {
    it('gets the address of the source for an asset address', async function () {
      expect(await this.provider.getSourceOfAsset(this.USDTAddress)).to.equal(this.USDTETH.address)
      expect(await this.provider.getSourceOfAsset(this.LINKAddress)).to.equal(this.LINKETH.address)
    })
  })

  describe('setETHAddress', function () {
    it('sets the ethAddress', async function () {
      // Already set in beforeEach block
      expect(await this.provider.getETHAddress()).to.equal(this.WETHAddress)
    })

    it('reverts if zero address is provided', async function () {
      await expectRevert(this.provider.setETHAddress(constants.ZERO_ADDRESS, { from: owner }), 'ADDRESS_IS_ZERO')
    })

    it('restricts to only owner', async function () {
      await expectRevert(
        this.provider.setETHAddress(this.WETHAddress, { from: users[0] }),
        'Ownable: caller is not the owner'
      )
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
