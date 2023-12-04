// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({getNamedAccounts, deployments }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const governanceStrategy = '';
    const votingDelay = '';
    const guardian = '';
    const executors = [''];
  
    await deploy('Governance', {
      from: deployer,
      log: true,
      args: [
        governanceStrategy,
        votingDelay,
        guardian,
        executors
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['Governance'];
  