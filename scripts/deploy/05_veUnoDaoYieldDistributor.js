// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash

module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    if (!process.env.OWNER_MULTISIG) return;
    if (!process.env.UNO) return;
  
    const unoToken = `${process.env.UNO}`;
    const timeLockAddress = `${process.env.OWNER_MULTISIG}`;
    const owner = `${process.env.OWNER_MULTISIG}`;
    
    const votingEscrow = await deployments.get("VotingEscrow");
    const votingEscrowAddress = votingEscrow.address;
  
    const veUnoDao = await deploy("VeUnoDaoYieldDistributor", {
      from: deployer,
      contract: "VeUnoDaoYieldDistributor",
      log: true,
      proxy: {
        execute: {
          init: {
            methodName: "initialize",
            args: [unoToken, votingEscrowAddress, timeLockAddress, owner],
          },
        },
        proxyContract: "OpenZeppelinTransparentProxy",
      },
    })
  
    console.log(`deploy at ${veUnoDao.address}`)
  };
  
  module.exports.tags = ['VeUnoDaoYieldDistributor', 'UnoDao'];
  module.exports.dependencies = ['VotingEscrow'];
  