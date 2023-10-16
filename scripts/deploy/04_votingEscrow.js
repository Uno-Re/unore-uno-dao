// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // address _token_addr,
    //     string memory _name,
    //     string memory _symbol,
    //     string memory _version,
    //     address _ownership
  
    this.mockUno = await deployments.get('MockUno');
    const mockUnoAddress = this.mockUno.address;
    const _name = 'UnoDao Voting';
    const _symbol = 'UnoDaoVE';
    const _version = '1';

    this.ownership = await deployments.get('Ownership');
    const ownershipAddress = this.ownership.address;
  
    await deploy('VotingEscrow', {
      from: deployer,
      log: true,
      args: [
        mockUnoAddress,
        _name,
        _symbol,
        _version,
        ownershipAddress
      ],
      deterministicDeployment: false
    });
  };
  
  module.exports.tags = ['VotingEscrow', 'UnoDao'];
  module.exports.dependencies = ['MockUno', 'MockUno'];
  