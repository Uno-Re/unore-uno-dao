// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const _yieldDistributor = '0x9Dd1437C718C58a8D5c78156ea7267793BCe72e7'
    const UNO = '0x092183fC3337977351F20bddBC1B667e0E2CC365' // this.mockUno.address;
    const _veUno = '0xe1D2Ca6232b04749B527238686b2fA080B02eF83';
    const _admin = '0xB4828FBf7753Ade73B608604690128e1FD1e9d3B'; // votingEscrow.address;
  
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
  