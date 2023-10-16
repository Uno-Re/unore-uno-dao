// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const _yieldDistributor = '0x50A7C5A1a143E7Ada93b6F69027Fe329869A75f1'
    const UNO = '0x474021845C4643113458ea4414bdb7fB74A01A77' // this.mockUno.address;
    const _veUno = '0xBdBC1af93D95909625b18775b14c7D21E00775Aa';
    const _admin = '0x440365317Cc5CA4D26288f708B07ef79cea80474'; // votingEscrow.address;
  
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
  