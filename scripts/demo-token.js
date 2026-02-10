const hre = require("hardhat");

/**
 * Demo script — Creates a token via AITokenFactory on BSC Testnet
 * Produces on-chain proof (contract address + tx hash) for hackathon judges
 */
async function main() {
    console.log("🎬 Forken Token Factory — Demo\n");
    console.log("⚠️  Out of scope: No liquidity, no launch, no fundraising.\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "BNB\n");

    if (balance < hre.ethers.parseEther("0.001")) {
        console.log("❌ Insufficient balance. Need at least 0.001 BNB.");
        console.log("   Faucet: https://www.bnbchain.org/en/testnet-faucet");
        return;
    }

    // Load factory address
    const deployment = require("../deployment-token-factory.json");
    const factoryAddress = deployment.contracts.AITokenFactory;
    console.log("Factory:", factoryAddress);

    // Connect to factory
    const AITokenFactory = await hre.ethers.getContractFactory("AITokenFactory");
    const factory = AITokenFactory.attach(factoryAddress);

    // Check current state
    const countBefore = await factory.getTokenCount();
    console.log("Tokens created so far:", Number(countBefore), "\n");

    // ============ Create Demo Token ============
    console.log("📦 Creating demo token...");
    console.log("   Name:    ForKen Demo Token");
    console.log("   Symbol:  FKD");
    console.log("   Supply:  1,000,000 FKD");
    console.log("   Decimals: 18\n");

    const tx = await factory.createToken(
        "ForKen Demo Token",
        "FKD",
        18,
        hre.ethers.parseUnits("1000000", 18)
    );

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    // Extract token address from event
    const event = receipt.logs.find(log => {
        try {
            return factory.interface.parseLog(log)?.name === "TokenCreated";
        } catch { return false; }
    });

    let tokenAddress = "unknown";
    if (event) {
        const parsed = factory.interface.parseLog(event);
        tokenAddress = parsed.args[1]; // tokenAddress is 2nd arg
    }

    // ============ Results ============
    console.log("\n✅ Token created successfully!\n");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│  ON-CHAIN PROOF                                 │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│  Factory:  ", factoryAddress);
    console.log("│  Token:    ", tokenAddress);
    console.log("│  TX Hash:  ", tx.hash);
    console.log("│  Block:    ", receipt.blockNumber);
    console.log("│  Network:   BSC Testnet (chainId: 97)");
    console.log("└─────────────────────────────────────────────────┘");

    // Verify the token
    console.log("\n📊 Verification:");
    const countAfter = await factory.getTokenCount();
    console.log("   Total tokens:", Number(countAfter));

    const userTokens = await factory.getUserTokens(deployer.address);
    console.log("   Your tokens:", userTokens.length);

    if (tokenAddress !== "unknown") {
        const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
        const token = SimpleToken.attach(tokenAddress);
        console.log("   Token name:", await token.name());
        console.log("   Token symbol:", await token.symbol());
        console.log("   Total supply:", hre.ethers.formatUnits(await token.totalSupply(), 18), "FKD");
        console.log("   Owner:", await token.owner());
    }

    console.log("\n🔗 View on BSCScan:");
    console.log("   Factory: https://testnet.bscscan.com/address/" + factoryAddress);
    console.log("   Token:   https://testnet.bscscan.com/address/" + tokenAddress);
    console.log("   TX:      https://testnet.bscscan.com/tx/" + tx.hash);

    console.log("\n🎉 Demo complete! This token was created for demonstration only.");
    console.log("   No liquidity, no launch, no fundraising.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error.message);
        process.exit(1);
    });
