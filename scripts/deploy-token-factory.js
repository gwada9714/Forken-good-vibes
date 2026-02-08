/**
 * Deploy AITokenFactory to BSC Testnet
 * BNB Good Vibes Only Hackathon
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     AITokenFactory Deployment - BNB Good Vibes Only        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const [deployer] = await hre.ethers.getSigners();
    console.log("\n📍 Deploying with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "BNB");

    // Deploy AITokenFactory
    console.log("\n🚀 Deploying AITokenFactory...");
    const AITokenFactory = await hre.ethers.getContractFactory("AITokenFactory");
    const factory = await AITokenFactory.deploy();
    await factory.waitForDeployment();

    const factoryAddress = await factory.getAddress();
    console.log("✅ AITokenFactory deployed to:", factoryAddress);

    // Create deployment file
    const deployment = {
        network: hre.network.name,
        chainId: (await deployer.provider.getNetwork()).chainId.toString(),
        contracts: {
            AITokenFactory: factoryAddress
        },
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        type: "AI Token Creation Agent"
    };

    const deploymentPath = path.join(__dirname, "..", "deployment-token-factory.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log("\n📄 Deployment info saved to:", deploymentPath);

    // Verify on BscScan (if API key available)
    if (process.env.BSCSCAN_API_KEY) {
        console.log("\n🔍 Verifying contract on BscScan...");
        try {
            await hre.run("verify:verify", {
                address: factoryAddress,
                constructorArguments: []
            });
            console.log("✅ Contract verified!");
        } catch (error) {
            console.log("⚠️ Verification failed:", error.message);
        }
    }

    console.log("\n════════════════════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("════════════════════════════════════════════════════════════");
    console.log("AITokenFactory:", factoryAddress);
    console.log("BscScan:", `https://testnet.bscscan.com/address/${factoryAddress}`);
    console.log("════════════════════════════════════════════════════════════\n");

    return factoryAddress;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
