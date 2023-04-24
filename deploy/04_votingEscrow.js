// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const unoAddress = "0x474021845c4643113458ea4414bdb7fb74a01a77";
    const _name = 'Vote-Escrowed UNO';
    const _symbol = 'veUNO';
    const _version = '1';

    const ownershipAddress = '0x311520b1B66fc271c95aD8C36C0A3391Cd764C67';
  
    await deploy('VotingEscrow', {
      from: deployer,
      log: true,
      args: [
        unoAddress,
        _name,
        _symbol,
        _version,
        ownershipAddress
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['Vote-Escrowed UNO', 'UnoDao'];
  