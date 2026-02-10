const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "BNB\n");

    const factoryAddress = "0xdaAD8d3679EAF994363b83D49c8159f98144b580";
    const AITokenFactory = await hre.ethers.getContractFactory("AITokenFactory");
    const factory = AITokenFactory.attach(factoryAddress);

    console.log("Creating ForKen Demo Token on BSC Mainnet...");
    const tx = await factory.createToken(
        "ForKen Demo Token",
        "FKD",
        18,
        hre.ethers.parseUnits("1000000", 18)
    );

    console.log("TX Hash:", tx.hash);
    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();

    const event = receipt.logs.find(log => {
        try { return factory.interface.parseLog(log)?.name === "TokenCreated"; }
        catch { return false; }
    });

    if (event) {
        const parsed = factory.interface.parseLog(event);
        console.log("\n✅ Token created!");
        console.log("Token Address:", parsed.args[1]);
        console.log("TX:", tx.hash);
        console.log("BscScan:", "https://bscscan.com/address/" + parsed.args[1]);
    }

    const count = await factory.getTokenCount();
    console.log("Total tokens:", Number(count));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
