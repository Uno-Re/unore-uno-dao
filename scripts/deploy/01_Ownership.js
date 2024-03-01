// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// We will use this for collateral asset in rinkeby test
module.exports = async function ({ ethers, getNamedAccounts, deployments, getChainId }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!process.env.OWNER_MULTISIG) {
    console.log("No multisig");
    return;
  }

  await deploy('Ownership', {
    from: deployer,
    log: true,
    args: [`${process.env.OWNER_MULTISIG}`],
    deterministicDeployment: false
  });
};

module.exports.tags = ['Ownership', 'UnoDao'];
