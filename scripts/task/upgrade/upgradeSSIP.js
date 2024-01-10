const { ethers, network, upgrades } = require("hardhat");

const proxyAdminABI = require("../../abis/proxyAdmin.json");

async function main() {

    const proxyAdminAddress = "0xBA08E0d962f01a6418659B0cd94De1d5b4966Fdf";
    const proxyAdmin = await ethers.getContractAt(proxyAdminABI, proxyAdminAddress);

    let ssipProxyAddress = "0x5aC3f5c5310E067573302eE2977F46000f0fca03";
    let newImplementaion = "0xaF7265a67e527277C04629d6016437c3072BBF08";

    const aa = await ethers.getSigners();
    
    let tx = await proxyAdmin.connect(aa[0]).upgrade(ssipProxyAddress, newImplementaion);

}

main();