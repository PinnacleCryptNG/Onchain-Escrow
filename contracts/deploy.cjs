/**
 * Hardhat / Node Deployment Script for Base Sepolia
 * Run via: npx hardhat run contracts/deploy.cjs --network baseSepolia
 * Or with standard ethers/viem script.
 */
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Escrow contract to Base Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  console.log("Escrow contract deployed to:", contractAddress);
  console.log("Verify on Basescan with:");
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
