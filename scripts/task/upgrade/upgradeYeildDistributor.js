const { ethers, network, upgrades } = require("hardhat");

const proxyAdminABI = require("../../abis/proxyAdmin.json");

async function main() {

    const proxyAdminAddress = "0xBA08E0d962f01a6418659B0cd94De1d5b4966Fdf";
    const proxyAdmin = await ethers.getContractAt(proxyAdminABI, proxyAdminAddress);

    let yeildProxyAddress = "";
    let newImplementaion = "";

    const aa = await ethers.getSigners();
    
    let tx = await proxyAdmin.connect(aa[0]).upgrade(yeildProxyAddress, newImplementaion);

}

main();