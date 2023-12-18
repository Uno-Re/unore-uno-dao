const { ethers, network, upgrades } = require("hardhat");

const proxyAdminABI = require("../../abis/proxyAdmin.json");

async function main() {

    const proxyAdminAddress = "0xBA08E0d962f01a6418659B0cd94De1d5b4966Fdf";
    const proxyAdmin = await ethers.getContractAt(proxyAdminABI, proxyAdminAddress);

    let ssrpProxyAddress = "0x57fFdCCDf010262a358DA540a991F5ACCe010CAE";
    let newImplementaion = "0x0F65735c468be8a2476BcF8603218b29f3E21Ca9";

    const aa = await ethers.getSigners();
    
    let tx = await proxyAdmin.connect(aa[0]).upgrade(ssrpProxyAddress, newImplementaion);

}

main();
