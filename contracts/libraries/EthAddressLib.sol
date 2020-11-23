// Base on aave-protocol
// https://github.com/aave/aave-protocol/blob/e8d020e9752fbd4807a3b55f9cf98a88dcfb674d/contracts/libraries/EthAddressLib.sol
// Changes:
// - Upgrade to solidity 0.6.11

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.11;

library EthAddressLib {
    /**
     * @dev returns the address used within the protocol to identify ETH
     * @return the address assigned to ETH
     */
    function ethAddress() internal pure returns (address) {
        return 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    }
}
