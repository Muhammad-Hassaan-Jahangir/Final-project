const { ethers, artifacts } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MilestoneEscrow contract
  const MilestoneEscrow = await ethers.getContractFactory("MilestoneEscrow");
  const milestoneEscrow = await MilestoneEscrow.deploy(deployer.address);
  await milestoneEscrow.deployed();

  console.log("MilestoneEscrow deployed to:", milestoneEscrow.address);

  // Save the contract ABI and address
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const contractArtifact = artifacts.readArtifactSync("MilestoneEscrow");

  fs.writeFileSync(
    contractsDir + "/MilestoneEscrow.json",
    JSON.stringify(contractArtifact, null, 2)
  );

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ MilestoneEscrow: milestoneEscrow.address }, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });