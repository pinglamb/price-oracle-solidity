#!/usr/bin/env node

const { execSync } = require('child_process');
const { runCoverage } = require('@openzeppelin/test-environment');

async function main() {
  await runCoverage(['mocks/', 'Migrations.sol'], 'yarn compile:coverage', ['./node_modules/.bin/mocha']);

  if (process.env.CI) {
    execSync('curl -s https://codecov.io/bash | bash -s -- -C "$GITHUB_SHA"', { stdio: 'inherit' });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
