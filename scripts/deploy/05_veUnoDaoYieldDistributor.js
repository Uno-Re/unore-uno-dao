// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const mockUno = await deployments.get('MockUno');
    const mockUnoAddress = mockUno.address;
    const timeLockAddress = '0x7e47419EFE3E49f3E616965bFa96f089b2b0e574';
    const votingEscrow = await deployments.get("VotingEscrow");
    const votingEscrowAddress = votingEscrow.address;
  
    await deploy('VeUnoDaoYieldDistributor', {
      from: deployer,
      log: true,
      args: [],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['VeUnoDaoYieldDistributor', 'UnoDao'];
  module.exports.dependencies = ['MockUno', 'MockUno', 'VotingEscrow'];
  