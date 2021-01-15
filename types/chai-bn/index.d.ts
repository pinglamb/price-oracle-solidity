/// <reference types="chai" />

declare global {
  namespace Chai {
    export interface Assertion {
      bignumber: Assertion
    }
  }
}

declare const chaiBN: Chai.ChaiPlugin
export = chaiBN
