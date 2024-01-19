// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    const mockUno = await deployments.get('MockUno');
    const mockUnoAddress = mockUno.address;
    const timeLockAddress = '0x7e47419EFE3E49f3E616965bFa96f089b2b0e574';
    const votingEscrow = await deployments.get("VotingEscrow");
    const votingEscrowAddress = votingEscrow.address;
    const owner = "0xB4828FBf7753Ade73B608604690128e1FD1e9d3B";
  
    const veUnoDao = await deploy("VeUnoDaoYieldDistributor", {
      from: deployer,
      contract: "VeUnoDaoYieldDistributor",
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [mockUnoAddress, votingEscrowAddress, timeLockAddress, owner],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
    })
  
    console.log(`deploy at ${veUnoDao.address}`)
  };
  
  module.exports.tags = ['VeUnoDaoYieldDistributor', 'UnoDao'];
  module.exports.dependencies = ['MockUno', 'MockUno', 'VotingEscrow'];
  