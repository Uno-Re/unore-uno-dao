// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    if (!process.env.OWNER_MULTISIG) return;
    if (!process.env.UNO) return;
  
    const unoToken = `${process.env.UNO}`;
    const _name = 'Vote-Escrowed UNO';
    const _symbol = 'veUNO';
    const _version = '1';

    this.ownership = await deployments.get('Ownership');
    const ownershipAddress = this.ownership.address;
  
    await deploy('VotingEscrow', {
      from: deployer,
      log: true,
      args: [
        unoToken,
        _name,
        _symbol,
        _version,
        ownershipAddress,
        `${process.env.OWNER_MULTISIG}`
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['VotingEscrow', 'UnoDao'];
  