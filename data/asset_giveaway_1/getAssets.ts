import fs from 'fs';
import {BigNumber} from 'ethers';
import MerkleTree from '../../lib/merkleTree';
import helpers from '../../lib/merkleTreeHelper';

const {createDataArrayAssets, saltAssets} = helpers;

export type AssetClaim = {
  reservedAddress: string;
  assetIds: Array<BigNumber> | Array<string> | Array<number>;
  assetValues: Array<number>;
  salt?: string;
};

export function createAssetClaimMerkleTree(
  isDeploymentChainId: boolean,
  chainId: string,
  assetData: Array<AssetClaim>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): {
  assets: AssetClaim[];
  merkleRootHash: string;
  saltedAssets: AssetClaim[];
  tree: MerkleTree;
} {
  let secretPath = './secret/.asset_giveaway_1_secret';
  if (BigNumber.from(chainId).toString() === '1') {
    console.log('MAINNET secret');
    secretPath = './secret/.asset_giveaway_1_secret.mainnet';
  }

  let expose = false;
  let secret;
  try {
    secret = fs.readFileSync(secretPath);
  } catch (e) {
    if (isDeploymentChainId) {
      throw e;
    }
    secret =
      '0x4467363716526536535425451427798982881775318563547751090997863683';
  }

  if (!isDeploymentChainId) {
    expose = true;
  }

  const saltedAssets = saltAssets(assetData, secret);
  const tree = new MerkleTree(createDataArrayAssets(saltedAssets));
  const merkleRootHash = tree.getRoot().hash;

  return {
    assets: expose ? saltedAssets : assetData,
    merkleRootHash,
    saltedAssets,
    tree,
  };
}
