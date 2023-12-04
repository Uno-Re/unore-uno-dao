// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({getNamedAccounts, deployments}) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    let admin = "";
    let delay = "10";
    let gracePeriod = "";
    let minimumDelay = "";
    let maximumDelay = "";
    let propositionThreshold = "2000";
    let voteDuration = "";
    let voteDifferential = "";
    let minimumQuorum = "";
  
    await deploy('Executor', {
      from: deployer,
      log: true,
      args: [
        admin,
        delay,
        gracePeriod,
        minimumDelay,
        maximumDelay,
        propositionThreshold,
        voteDuration,
        voteDifferential,
        minimumQuorum
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['Executor'];
  