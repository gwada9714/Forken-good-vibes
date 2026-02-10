const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITokenFactory", function () {
    let factory;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const AITokenFactory = await ethers.getContractFactory("AITokenFactory");
        factory = await AITokenFactory.deploy();
        await factory.waitForDeployment();
    });

    // ============ Deployment ============

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await factory.owner()).to.equal(owner.address);
        });

        it("Should start with zero tokens", async function () {
            expect(await factory.getTokenCount()).to.equal(0);
        });
    });

    // ============ Token Creation ============

    describe("Token Creation", function () {
        it("Should create a token with correct parameters", async function () {
            const tx = await factory.connect(user1).createToken(
                "ForKen Demo Token",
                "FKD",
                18,
                ethers.parseUnits("1000000", 18)
            );

            const receipt = await tx.wait();
            expect(await factory.getTokenCount()).to.equal(1);

            // Get the created token address
            const userTokens = await factory.getUserTokens(user1.address);
            expect(userTokens.length).to.equal(1);

            // Verify token properties
            const SimpleToken = await ethers.getContractFactory("SimpleToken");
            const token = SimpleToken.attach(userTokens[0]);

            expect(await token.name()).to.equal("ForKen Demo Token");
            expect(await token.symbol()).to.equal("FKD");
            expect(await token.decimals()).to.equal(18);
            expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
        });

        it("Should assign ownership to the creator, not the factory", async function () {
            await factory.connect(user1).createToken("Test", "TST", 18, ethers.parseUnits("100", 18));
            const userTokens = await factory.getUserTokens(user1.address);

            const SimpleToken = await ethers.getContractFactory("SimpleToken");
            const token = SimpleToken.attach(userTokens[0]);

            expect(await token.owner()).to.equal(user1.address);
        });

        it("Should mint all supply to the creator", async function () {
            const supply = ethers.parseUnits("500000", 18);
            await factory.connect(user1).createToken("Test", "TST", 18, supply);
            const userTokens = await factory.getUserTokens(user1.address);

            const SimpleToken = await ethers.getContractFactory("SimpleToken");
            const token = SimpleToken.attach(userTokens[0]);

            expect(await token.balanceOf(user1.address)).to.equal(supply);
        });

        it("Should support custom decimals", async function () {
            await factory.connect(user1).createToken("USDT Clone", "USDTC", 6, ethers.parseUnits("1000000", 6));
            const userTokens = await factory.getUserTokens(user1.address);

            const SimpleToken = await ethers.getContractFactory("SimpleToken");
            const token = SimpleToken.attach(userTokens[0]);

            expect(await token.decimals()).to.equal(6);
        });

        it("Should allow multiple tokens from the same user", async function () {
            await factory.connect(user1).createToken("Token A", "TKA", 18, ethers.parseUnits("100", 18));
            await factory.connect(user1).createToken("Token B", "TKB", 18, ethers.parseUnits("200", 18));

            const userTokens = await factory.getUserTokens(user1.address);
            expect(userTokens.length).to.equal(2);
            expect(await factory.getTokenCount()).to.equal(2);
        });

        it("Should track tokens from different users separately", async function () {
            await factory.connect(user1).createToken("User1 Token", "U1T", 18, ethers.parseUnits("100", 18));
            await factory.connect(user2).createToken("User2 Token", "U2T", 18, ethers.parseUnits("200", 18));

            const user1Tokens = await factory.getUserTokens(user1.address);
            const user2Tokens = await factory.getUserTokens(user2.address);

            expect(user1Tokens.length).to.equal(1);
            expect(user2Tokens.length).to.equal(1);
            expect(user1Tokens[0]).to.not.equal(user2Tokens[0]);
            expect(await factory.getTokenCount()).to.equal(2);
        });
    });

    // ============ Events ============

    describe("Events", function () {
        it("Should emit TokenCreated event with correct parameters", async function () {
            const supply = ethers.parseUnits("1000000", 18);

            await expect(factory.connect(user1).createToken("Event Token", "EVT", 18, supply))
                .to.emit(factory, "TokenCreated")
                .withArgs(
                    user1.address,
                    (addr) => addr !== ethers.ZeroAddress, // any non-zero address
                    "Event Token",
                    "EVT",
                    supply,
                    (ts) => ts > 0 // any positive timestamp
                );
        });
    });

    // ============ Input Validation ============

    describe("Input Validation", function () {
        it("Should reject empty name", async function () {
            await expect(
                factory.connect(user1).createToken("", "TST", 18, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("AITokenFactory: name required");
        });

        it("Should reject empty symbol", async function () {
            await expect(
                factory.connect(user1).createToken("Test", "", 18, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("AITokenFactory: symbol required");
        });

        it("Should reject symbol longer than 11 characters", async function () {
            await expect(
                factory.connect(user1).createToken("Test", "TOOLONGSYMBOL", 18, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("AITokenFactory: symbol too long");
        });

        it("Should reject zero supply", async function () {
            await expect(
                factory.connect(user1).createToken("Test", "TST", 18, 0)
            ).to.be.revertedWith("AITokenFactory: supply must be > 0");
        });
    });

    // ============ View Functions ============

    describe("View Functions", function () {
        beforeEach(async function () {
            // Create 3 tokens
            await factory.connect(user1).createToken("Token 1", "TK1", 18, ethers.parseUnits("100", 18));
            await factory.connect(user1).createToken("Token 2", "TK2", 18, ethers.parseUnits("200", 18));
            await factory.connect(user2).createToken("Token 3", "TK3", 18, ethers.parseUnits("300", 18));
        });

        it("Should return correct token count", async function () {
            expect(await factory.getTokenCount()).to.equal(3);
        });

        it("Should return paginated tokens", async function () {
            const first2 = await factory.getTokens(0, 2);
            expect(first2.length).to.equal(2);

            const last1 = await factory.getTokens(2, 10);
            expect(last1.length).to.equal(1);
        });

        it("Should return empty array for out-of-range offset", async function () {
            const tokens = await factory.getTokens(100, 10);
            expect(tokens.length).to.equal(0);
        });

        it("Should return user tokens correctly", async function () {
            const user1Tokens = await factory.getUserTokens(user1.address);
            expect(user1Tokens.length).to.equal(2);
        });
    });
});
