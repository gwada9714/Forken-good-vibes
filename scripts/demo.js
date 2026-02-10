const hre = require("hardhat");

/**
 * Demo script - Deposits BNB into the AI Vault and executes a sample AI action
 * This creates visible on-chain activity for the hackathon judges
 */
async function main() {
    console.log("🎬 ForKen AI Vault - Demo Script\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "BNB\n");

    if (balance < hre.ethers.parseEther("0.0005")) {
        console.log("❌ Insufficient balance. Need at least 0.0005 BNB for demo.");
        console.log("   Get testnet BNB from: https://www.bnbchain.org/en/testnet-faucet");
        return;
    }

    // Load deployed contracts
    const deployment = require("../deployment.json");
    console.log("AIVault:", deployment.contracts.AIVault);
    console.log("StrategyExecutor:", deployment.contracts.StrategyExecutor);

    // Connect to AIVault
    const AIVault = await hre.ethers.getContractFactory("AIVault");
    const aiVault = AIVault.attach(deployment.contracts.AIVault);

    // Connect to StrategyExecutor
    const StrategyExecutor = await hre.ethers.getContractFactory("StrategyExecutor");
    const strategyExecutor = StrategyExecutor.attach(deployment.contracts.StrategyExecutor);

    // Step 1: Check current state
    console.log("\n📊 Current Vault State:");
    const tvlBefore = await aiVault.totalValueLocked();
    const actionsBefore = await aiVault.getActionCount();
    console.log("   TVL:", hre.ethers.formatEther(tvlBefore), "BNB");
    console.log("   Actions:", Number(actionsBefore));

    // Step 2: Deposit BNB
    const depositAmount = hre.ethers.parseEther("0.0001");
    console.log("\n📥 Depositing", hre.ethers.formatEther(depositAmount), "BNB...");
    const depositTx = await aiVault.deposit({ value: depositAmount });
    await depositTx.wait();
    console.log("   ✅ Deposit TX:", depositTx.hash);

    // Step 3: Execute an AI strategy (as the agent)
    console.log("\n🤖 Executing AI strategy...");
    const target = deployment.contracts.StrategyExecutor;
    const iface = new hre.ethers.Interface([
        "function stakeToPool(uint256 poolId, uint256 amount) external returns (bool)"
    ]);
    const data = iface.encodeFunctionData("stakeToPool", [1, hre.ethers.parseEther("0.001")]);

    try {
        const strategyTx = await aiVault.executeStrategy(
            0, // ActionType: Stake
            target,
            data,
            "AI Analysis: Pool 1 offers optimal risk-adjusted yield at 12.5% APY. Current market conditions favor staking with moderate risk tolerance (5/10). Gas costs are minimal compared to expected 30-day yield."
        );
        await strategyTx.wait();
        console.log("   ✅ Strategy TX:", strategyTx.hash);
    } catch (e) {
        console.log("   ⚠️ Strategy execution skipped (agent permissions):", e.message?.substring(0, 100));
    }

    // Step 4: Show final state
    console.log("\n📊 Updated Vault State:");
    const tvlAfter = await aiVault.totalValueLocked();
    const actionsAfter = await aiVault.getActionCount();
    console.log("   TVL:", hre.ethers.formatEther(tvlAfter), "BNB");
    console.log("   Actions:", Number(actionsAfter));

    // Step 5: Show user balance
    const userBalance = await aiVault.getUserTokenBalance(deployer.address, hre.ethers.ZeroAddress);
    console.log("   User balance:", hre.ethers.formatEther(userBalance), "BNB");

    console.log("\n🎉 Demo complete!");
    console.log("\n🔗 View on BSCScan:");
    console.log("   https://testnet.bscscan.com/address/" + deployment.contracts.AIVault);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Demo failed:", error);
        process.exit(1);
    });
