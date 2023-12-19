const { ethers, network, upgrades } = require("hardhat");

const proxyAdminABI = require("../../abis/proxyAdmin.json");

async function main() {

    const proxyAdminAddress = "0xBA08E0d962f01a6418659B0cd94De1d5b4966Fdf";
    const proxyAdmin = await ethers.getContractAt(proxyAdminABI, proxyAdminAddress);

    let capitalAgentProxyAddress = "0xa50F3fD32d7Ead49a5C34091744bE516b67417cA";
    let newImplementaion = "0x822875bCAe1af9D4a61911A89D535062A797891d";

    const aa = await ethers.getSigners();
    
    let tx = await proxyAdmin.connect(aa[0]).upgrade(capitalAgentProxyAddress, newImplementaion);

}

main();