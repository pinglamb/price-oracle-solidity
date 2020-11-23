module.exports = {
  networks: {
    coverage: {
      host: '127.0.0.1',
      port: 8555,
      network_id: '*',
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
  compilers: {
    solc: {
      version: '0.6.11',
      settings: {
        optimizer: {
          // Disable optimization for instrumenting
          enabled: false,
        },
      },
    },
  },
  plugins: ['solidity-coverage'],
};
