import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments} = hre;
  const {execute, read} = deployments;

  const DeployerBatch = await deployments.get('DeployerBatch');

  let currentBouncerAdmin;
  try {
    currentBouncerAdmin = await read('Asset', 'getBouncerAdmin');
  } catch (e) {
    // no admin
  }

  let deployerBatchIsBouncer;
  try {
    deployerBatchIsBouncer = await read(
      'Asset',
      'isBouncer',
      DeployerBatch.address
    );
  } catch (e) {
    //
  }
  if (!deployerBatchIsBouncer) {
    // Need to execute setBouncer in order for DeployerBatch to be able to mint
    await execute(
      'Asset',
      {from: currentBouncerAdmin, log: true},
      'setBouncer',
      DeployerBatch.address,
      true
    );
  }
};
export default func;
func.runAtTheEnd = true;
func.tags = ['Asset', 'Asset_setup'];
func.dependencies = ['Asset_deploy', 'DeployerBatch_deploy'];

func.skip = async () => false; // TODO remove script once done
