// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({getNamedAccounts, deployments}) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    let uno = "";
    let stkUNO = "";
  
    await deploy('GovernanceStrategy', {
      from: deployer,
      log: true,
      args: [
        uno,
        stkUNO,
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['GovernanceStrategy'];
  