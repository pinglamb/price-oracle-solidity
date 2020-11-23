import { accounts, contract } from '@openzeppelin/test-environment'
import { ether, expectRevert, constants } from '@openzeppelin/test-helpers'
import { expect } from 'chai'

const ChainlinkProxyPriceProvider = contract.fromArtifact('ChainlinkProxyPriceProvider')

describe('ChainlinkProxyPriceProvider', function () {
  const [owner, ...users] = accounts

  beforeEach(async function () {
    this.provider = await ChainlinkProxyPriceProvider.new([], [], constants.ZERO_ADDRESS, { from: owner })
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
