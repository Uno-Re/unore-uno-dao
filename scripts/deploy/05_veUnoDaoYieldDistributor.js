// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    this.mockUno = await deployments.get('MockUno');
    const mockUnoAddress = '0x3a554dc1EAc143FC4640b0294A342B4F9089FDE6' // this.mockUno.address;
    const timeLockAddress = '0x7e47419EFE3E49f3E616965bFa96f089b2b0e574';
    // const votingEscrow = await deployments.get("VotingEscrow");
    const votingEscrowAddress = '0xE55A92fa510e2d277E4cF947189D0523683D63EC'; // votingEscrow.address;
  
    await deploy('VeUnoDaoYieldDistributor', {
      from: deployer,
      log: true,
      args: [
        mockUnoAddress,
        timeLockAddress,
        votingEscrowAddress
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['VeUnoDaoYieldDistributor', 'UnoDao'];
  module.exports.dependencies = ['MockUno', 'MockUno', 'VotingEscrow'];
  