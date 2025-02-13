import hre from 'hardhat';
import {DeployFunction} from 'hardhat-deploy/types';
import deploy from '../deploy/2090_deploy_asset';
import setupBatchDeployerAsAssetBouncer from '../deploy/9040_asset_bouncer_enable_deployer_batch';
import regenerate from './asset_regenerate';
import distribute from './asset_distribute';

const func: DeployFunction = async function () {
  await deploy(hre);
  await setupBatchDeployerAsAssetBouncer(hre);
  await regenerate(hre);
  await distribute(hre);
};
export default func;

if (require.main === module) {
  func(hre);
}
