const {
  ethers,
  getUnnamedAccounts,
  getNamedAccounts,
  deployments,
} = require('hardhat');
const {waitFor, recurseTests} = require('../utils');
const generateERC20Tests = require('../erc20');

function testGem(gemName) {
  const erc20Tests = generateERC20Tests(
    async () => {
      const others = await getUnnamedAccounts();
      const {deployer} = await getNamedAccounts();
      await deployments.fixture();
      const contract = await ethers.getContract(gemName);

      function mint(to, amount) {
        return waitFor(
          contract.connect(ethers.provider.getSigner(deployer)).mint(to, amount)
        );
      }

      return {
        ethersProvider: ethers.provider,
        contractAddress: contract.address,
        users: others,
        mint,
      };
    },
    {
      EIP717: true,
      burn: false,
    }
  );

  describe(gemName, function () {
    for (const test of erc20Tests) {
      // eslint-disable-next-line mocha/no-setup-in-describe
      recurseTests(test);
    }
  });
}

testGem('Gem_Power');
// testGem('Gem_Defense');
// testGem('Gem_Speed');
// testGem('Gem_Magic');
// testGem('Gem_Luck');
