import hre, {
  ethers,
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
} from 'hardhat';

import {waitFor, setupUsers} from '../utils';
// import asset_regenerate_and_distribute from '../../setup/asset_regenerate_and_distribute';

export const setupAsset = deployments.createFixture(async function () {
  await deployments.fixture(['Asset']);
  // await asset_regenerate_and_distribute(hre);
  const otherAccounts = await getUnnamedAccounts();
  const minter = otherAccounts[0];
  otherAccounts.splice(0, 1);

  const {assetBouncerAdmin} = await getNamedAccounts();

  const assetContractAsBouncerAdmin = await ethers.getContract(
    'Asset',
    assetBouncerAdmin
  );
  await waitFor(assetContractAsBouncerAdmin.setBouncer(minter, true));

  const Asset = await ethers.getContract('Asset', minter);

  let id = 0;
  const ipfsHashString =
    '0x78b9f42c22c3c8b260b781578da3151e8200c741c6b7437bafaff5a9df9b403e';

  async function mintAsset(to: string, value: number) {
    // Asset to be minted
    const creator = to;
    const packId = ++id;
    const hash = ipfsHashString;
    const supply = value;
    const rarity = 0;
    const owner = to;
    const data = '0x';

    const receipt = await waitFor(
      Asset.mint(creator, packId, hash, supply, rarity, owner, data)
    );
    const event = receipt.events?.filter(
      (event) => event.event === 'TransferSingle'
    )[0];
    if (!event) {
      throw new Error('no TransferSingle event after mint single');
    }
    return event.args?.id;
  }

  const users = await setupUsers(otherAccounts, {Asset});

  return {
    Asset,
    users,
    mintAsset,
  };
});
