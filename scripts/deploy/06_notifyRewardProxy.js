// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const _yieldDistributor = (await deployments.get("VeUnoDaoYieldDistributor")).address;
    const UNO = `${process.env.UNO}`;
    const _veUno = (await deployments.get("VotingEscrow")).address;
    const _admin = `${process.env.OWNER_MULTISIG}`;
  
    await deploy('NotifyRewardProxy', {
      from: deployer,
      log: true,
      args: [
        _yieldDistributor,
        UNO,
        _veUno,
        _admin
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['NotifyRewardProxy', 'UnoDao'];
  