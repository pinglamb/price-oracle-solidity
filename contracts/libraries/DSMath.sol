// SPDX-License-Identifier: MIT

// Courtesy of DappHub (https://github.com/dapphub/ds-math)
// Changes:
// - Upgrade to solidity 0.6.11
// - Keep only necessary functions
// - Added reciprocal

pragma solidity ^0.6.11;

library DSMath {
    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x, 'ds-math-add-overflow');
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, 'ds-math-mul-overflow');
    }

    uint256 constant WAD = 10**18;

    //rounds to zero if x*y < WAD / 2
    function wdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = add(mul(x, WAD), y / 2) / y;
    }

    function reciprocal(uint256 x) internal pure returns (uint256 z) {
        z = wdiv(WAD, x);
    }
}
