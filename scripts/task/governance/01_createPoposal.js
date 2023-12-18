const { ethers, network, upgrades } = require("hardhat");


async function main() {

    const governanceAddress = "";
    const governanceABI = "";
    const governance = await ethers.getContractAt(governanceABI, proxyAdminAddress);

    const aa = await ethers.getSigners();
    let executor;
    let targets;
    let values = [];
    let signatures = [];
    let calldatas = [];
    let withDelegatecalls = [];
    let ipfsHash;
    let tx = await governance.connect(aa[0]).create(executor, targets, values, signatures, calldatas, withDelegatecalls, ipfsHash);

}

main();