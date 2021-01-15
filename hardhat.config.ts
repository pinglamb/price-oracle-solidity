import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-web3'
import 'solidity-coverage'

export default {
  solidity: {
    version: '0.6.11',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    recursive: true,
    timeout: 12000,
    exit: true,
  },
}
