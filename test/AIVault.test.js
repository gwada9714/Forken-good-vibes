const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIVault", function () {
    let AIVault, aiVault;
    let StrategyExecutor, strategyExecutor;
    let MockForKenStaking, mockStaking;
    let owner, aiAgent, user1, user2;

    beforeEach(async function () {
        [owner, aiAgent, user1, user2] = await ethers.getSigners();

        // Deploy Mock Staking first
        MockForKenStaking = await ethers.getContractFactory("MockForKenStaking");
        mockStaking = await MockForKenStaking.deploy();
        await mockStaking.waitForDeployment();

        // Deploy AIVault
        AIVault = await ethers.getContractFactory("AIVault");
        aiVault = await AIVault.deploy(aiAgent.address);
        await aiVault.waitForDeployment();

        // Deploy StrategyExecutor
        StrategyExecutor = await ethers.getContractFactory("StrategyExecutor");
        strategyExecutor = await StrategyExecutor.deploy(await aiVault.getAddress());
        await strategyExecutor.waitForDeployment();

        // Configure AIVault
        await aiVault.setStrategyExecutor(await strategyExecutor.getAddress());

        // Configure StrategyExecutor with mock staking
        await strategyExecutor.setForKenStaking(await mockStaking.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await aiVault.owner()).to.equal(owner.address);
        });

        it("Should set the right AI agent", async function () {
            expect(await aiVault.aiAgent()).to.equal(aiAgent.address);
        });

        it("Should have BNB as supported token", async function () {
            expect(await aiVault.supportedTokens(ethers.ZeroAddress)).to.equal(true);
        });
    });

    describe("Deposits", function () {
        it("Should accept BNB deposits", async function () {
            const depositAmount = ethers.parseEther("1.0");

            await expect(aiVault.connect(user1).deposit({ value: depositAmount }))
                .to.emit(aiVault, "Deposited")
                .withArgs(user1.address, ethers.ZeroAddress, depositAmount);

            expect(await aiVault.getUserTokenBalance(user1.address, ethers.ZeroAddress))
                .to.equal(depositAmount);
            expect(await aiVault.totalValueLocked()).to.equal(depositAmount);
        });

        it("Should reject zero deposits", async function () {
            await expect(aiVault.connect(user1).deposit({ value: 0 }))
                .to.be.revertedWith("AIVault: amount must be > 0");
        });

        it("Should track multiple deposits", async function () {
            const deposit1 = ethers.parseEther("1.0");
            const deposit2 = ethers.parseEther("2.0");

            await aiVault.connect(user1).deposit({ value: deposit1 });
            await aiVault.connect(user1).deposit({ value: deposit2 });

            expect(await aiVault.getUserTokenBalance(user1.address, ethers.ZeroAddress))
                .to.equal(deposit1 + deposit2);
        });
    });

    describe("Withdrawals", function () {
        beforeEach(async function () {
            await aiVault.connect(user1).deposit({ value: ethers.parseEther("10.0") });
        });

        it("Should allow withdrawals", async function () {
            const withdrawAmount = ethers.parseEther("5.0");

            await expect(aiVault.connect(user1).withdraw(withdrawAmount))
                .to.emit(aiVault, "Withdrawn")
                .withArgs(user1.address, ethers.ZeroAddress, withdrawAmount);

            expect(await aiVault.getUserTokenBalance(user1.address, ethers.ZeroAddress))
                .to.equal(ethers.parseEther("5.0"));
        });

        it("Should reject withdrawals exceeding balance", async function () {
            const withdrawAmount = ethers.parseEther("20.0");

            await expect(aiVault.connect(user1).withdraw(withdrawAmount))
                .to.be.revertedWith("AIVault: insufficient balance");
        });
    });

    describe("AI Agent Actions", function () {
        it("Should only allow AI agent to execute strategies", async function () {
            const data = "0x";

            await expect(aiVault.connect(user1).executeStrategy(0, await strategyExecutor.getAddress(), data, "Test"))
                .to.be.revertedWith("AIVault: caller is not the AI agent");
        });

        it("Should allow AI agent to execute strategies", async function () {
            const target = await strategyExecutor.getAddress();
            const data = strategyExecutor.interface.encodeFunctionData("stakeToPool", [1, ethers.parseEther("1.0")]);

            // This should emit AIActionExecuted because staking is now configured
            await expect(aiVault.connect(aiAgent).executeStrategy(0, target, data, "Testing stake"))
                .to.emit(aiVault, "AIActionExecuted");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update AI agent", async function () {
            await expect(aiVault.connect(owner).setAIAgent(user2.address))
                .to.emit(aiVault, "AgentUpdated")
                .withArgs(aiAgent.address, user2.address);

            expect(await aiVault.aiAgent()).to.equal(user2.address);
        });

        it("Should not allow non-owner to update AI agent", async function () {
            await expect(aiVault.connect(user1).setAIAgent(user2.address))
                .to.be.revertedWithCustomError(aiVault, "OwnableUnauthorizedAccount");
        });

        it("Should allow owner to pause/unpause", async function () {
            await aiVault.connect(owner).pause();

            await expect(aiVault.connect(user1).deposit({ value: ethers.parseEther("1.0") }))
                .to.be.revertedWithCustomError(aiVault, "EnforcedPause");

            await aiVault.connect(owner).unpause();

            await expect(aiVault.connect(user1).deposit({ value: ethers.parseEther("1.0") }))
                .to.emit(aiVault, "Deposited");
        });
    });

    describe("Action History", function () {
        it("Should track action history", async function () {
            const target = await strategyExecutor.getAddress();
            const data = strategyExecutor.interface.encodeFunctionData("stakeToPool", [1, ethers.parseEther("1.0")]);

            await aiVault.connect(aiAgent).executeStrategy(0, target, data, "First action");
            await aiVault.connect(aiAgent).executeStrategy(0, target, data, "Second action");

            expect(await aiVault.getActionCount()).to.equal(2);

            const action = await aiVault.getAction(0);
            expect(action.reasoning).to.equal("First action");
        });

        it("Should return recent actions", async function () {
            const target = await strategyExecutor.getAddress();
            const data = strategyExecutor.interface.encodeFunctionData("stakeToPool", [1, ethers.parseEther("1.0")]);

            for (let i = 0; i < 5; i++) {
                await aiVault.connect(aiAgent).executeStrategy(0, target, data, `Action ${i}`);
            }

            const recent = await aiVault.getRecentActions(3);
            expect(recent.length).to.equal(3);
            expect(recent[0].reasoning).to.equal("Action 2");
            expect(recent[2].reasoning).to.equal("Action 4");
        });
    });
});
