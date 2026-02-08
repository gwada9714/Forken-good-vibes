const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying ForKen AI Vault...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "BNB\n");

    // Get AI Agent address from env or use deployer as fallback
    const aiAgentAddress = process.env.AI_AGENT_ADDRESS || deployer.address;
    console.log("AI Agent address:", aiAgentAddress);

    // Deploy AIVault
    console.log("\n📦 Deploying AIVault...");
    const AIVault = await hre.ethers.getContractFactory("AIVault");
    const aiVault = await AIVault.deploy(aiAgentAddress);
    await aiVault.waitForDeployment();
    const aiVaultAddress = await aiVault.getAddress();
    console.log("✅ AIVault deployed to:", aiVaultAddress);

    // Deploy StrategyExecutor
    console.log("\n📦 Deploying StrategyExecutor...");
    const StrategyExecutor = await hre.ethers.getContractFactory("StrategyExecutor");
    const strategyExecutor = await StrategyExecutor.deploy(aiVaultAddress);
    await strategyExecutor.waitForDeployment();
    const strategyExecutorAddress = await strategyExecutor.getAddress();
    console.log("✅ StrategyExecutor deployed to:", strategyExecutorAddress);

    // Configure AIVault with StrategyExecutor
    console.log("\n⚙️ Configuring AIVault...");
    await aiVault.setStrategyExecutor(strategyExecutorAddress);
    console.log("✅ StrategyExecutor set in AIVault");

    // Configure existing ForKen contracts if available
    if (process.env.FORKEN_STAKING_ADDRESS) {
        console.log("\n⚙️ Configuring ForKen Staking...");
        await strategyExecutor.setForKenStaking(process.env.FORKEN_STAKING_ADDRESS);
        console.log("✅ ForKen Staking configured");
    }

    if (process.env.FORKEN_BRIDGE_ADDRESS) {
        console.log("\n⚙️ Configuring ForKen Bridge...");
        await strategyExecutor.setForKenBridge(process.env.FORKEN_BRIDGE_ADDRESS);
        console.log("✅ ForKen Bridge configured");
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("\nContract Addresses:");
    console.log("  AIVault:", aiVaultAddress);
    console.log("  StrategyExecutor:", strategyExecutorAddress);
    console.log("\nNetwork:", hre.network.name);
    console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        aiAgent: aiAgentAddress,
        contracts: {
            AIVault: aiVaultAddress,
            StrategyExecutor: strategyExecutorAddress
        },
        timestamp: new Date().toISOString()
    };

    const fs = require("fs");
    fs.writeFileSync(
        "./deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n📄 Deployment info saved to deployment.json");

    // Verification instructions
    console.log("\n📋 To verify contracts on BSCScan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${aiVaultAddress} "${aiAgentAddress}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${strategyExecutorAddress} "${aiVaultAddress}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
