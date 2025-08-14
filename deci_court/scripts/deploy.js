// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    // 1. 获取部署者账户（Hardhat会自动提供20个测试账户）
    const [deployer, plaintiff, defendant, juror1, juror2, juror3] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // 2. 部署 JuryToken (JURY)
    const JuryTokenFactory = await ethers.getContractFactory("JuryToken");
    const juryToken = await JuryTokenFactory.deploy();
    await juryToken.waitForDeployment();
    
    console.log("\n--- JuryToken (JURY) Deployed ---");
    console.log("JuryToken deployed to:", await juryToken.getAddress());
    console.log(`Initial JURY balance of deployer: ${ethers.formatEther(await juryToken.balanceOf(deployer.address))}`);

    // 3. 部署 DeciCourt 合约
    const filingFee = ethers.parseEther("100"); // 100 JURY
    const jurorStake = ethers.parseEther("500"); // 500 JURY
    const jurySize = 3; // 为测试方便，设置为3人
    const commitDuration = 300; // 5分钟
    const revealDuration = 300; // 5分钟
    const penaltyRate = 50; // 50%
    const appealDepositMultiplier = 5; // 上诉保证金倍数
    const appealDuration = 600; // 上诉期限 10分钟
    const appealJurySize = 5; // 上诉陪审团规模

    const DeciCourtFactory = await ethers.getContractFactory("DeciCourt");
    const deciCourt = await DeciCourtFactory.deploy(
        await juryToken.getAddress(),
        filingFee,
        jurorStake,
        jurySize,
        commitDuration,
        revealDuration,
        penaltyRate,
        appealDepositMultiplier,
        appealDuration,
        appealJurySize
    );
    await deciCourt.waitForDeployment();

    console.log("\n--- DeciCourt Deployed ---");
    console.log("DeciCourt deployed to:", await deciCourt.getAddress());
    console.log("Configuration:");
    console.log(`  - Filing Fee: ${ethers.formatEther(filingFee)} JURY`);
    console.log(`  - Juror Stake: ${ethers.formatEther(jurorStake)} JURY`);
    console.log(`  - Jury Size: ${jurySize}`);

    // --- 准备工作：为测试账户分发JURY代币 ---
    console.log("\n--- Distributing JURY tokens for testing ---");

    // 每个账户分发 1000 JURY
    const amountToDistribute = ethers.parseEther("1000");
    await juryToken.connect(deployer).transfer(plaintiff.address, amountToDistribute);
    await juryToken.connect(deployer).transfer(defendant.address, amountToDistribute); // 虽然被告不需要，但可以备用
    await juryToken.connect(deployer).transfer(juror1.address, amountToDistribute);
    await juryToken.connect(deployer).transfer(juror2.address, amountToDistribute);
    await juryToken.connect(deployer).transfer(juror3.address, amountToDistribute);

    console.log(`Distributed ${ethers.formatEther(amountToDistribute)} JURY to Plaintiff, Juror1, Juror2, Juror3.`);
    console.log(`Plaintiff JURY balance: ${ethers.formatEther(await juryToken.balanceOf(plaintiff.address))}`);
    console.log(`Defendant JURY balance: ${ethers.formatEther(await juryToken.balanceOf(defendant.address))}`);
    console.log(`Juror1 JURY balance: ${ethers.formatEther(await juryToken.balanceOf(juror1.address))}`);
    console.log(`Juror2 JURY balance: ${ethers.formatEther(await juryToken.balanceOf(juror2.address))}`);
    console.log(`Juror3 JURY balance: ${ethers.formatEther(await juryToken.balanceOf(juror3.address))}`);

    // --- 演示新的声誉系统功能 ---
    console.log("\n--- Testing Reputation System ---");
    
    // 为所有测试账户授权DeciCourt合约
    await juryToken.connect(plaintiff).approve(await deciCourt.getAddress(), ethers.MaxUint256);
    await juryToken.connect(defendant).approve(await deciCourt.getAddress(), ethers.MaxUint256);
    await juryToken.connect(juror1).approve(await deciCourt.getAddress(), ethers.MaxUint256);
    await juryToken.connect(juror2).approve(await deciCourt.getAddress(), ethers.MaxUint256);
    await juryToken.connect(juror3).approve(await deciCourt.getAddress(), ethers.MaxUint256);
    
    // 注册陪审员
    await deciCourt.connect(juror1).registerAsJuror();
    await deciCourt.connect(juror2).registerAsJuror();
    await deciCourt.connect(juror3).registerAsJuror();
    
    console.log("Jurors registered successfully!");
    
    // 检查初始声誉分数
    const juror1Reputation = await deciCourt.getJurorReputation(juror1.address);
    const juror2Reputation = await deciCourt.getJurorReputation(juror2.address);
    const juror3Reputation = await deciCourt.getJurorReputation(juror3.address);
    
    console.log("\nInitial Reputation Scores:");
    console.log(`Juror1 - Score: ${juror1Reputation.reputationScore}, Correct: ${juror1Reputation.correctVotes}, Total: ${juror1Reputation.totalVotes}, Accuracy: ${juror1Reputation.accuracyRate}%`);
    console.log(`Juror2 - Score: ${juror2Reputation.reputationScore}, Correct: ${juror2Reputation.correctVotes}, Total: ${juror2Reputation.totalVotes}, Accuracy: ${juror2Reputation.accuracyRate}%`);
    console.log(`Juror3 - Score: ${juror3Reputation.reputationScore}, Correct: ${juror3Reputation.correctVotes}, Total: ${juror3Reputation.totalVotes}, Accuracy: ${juror3Reputation.accuracyRate}%`);
    
    console.log("\n--- Deployment Summary ---");
    console.log(`JuryToken Address: ${await juryToken.getAddress()}`);
    console.log(`DeciCourt Address: ${await deciCourt.getAddress()}`);
    console.log("\nNew Features Added:");
    console.log("✅ Dynamic Penalty System");
    console.log("✅ Reputation Tracking");
    console.log("✅ Novice Protection (50% penalty reduction for first 3 votes)");
    console.log("✅ High Reputation Rewards (20% penalty reduction for score > 70)");
    console.log("✅ Consecutive Wrong Vote Penalties (up to 80% max penalty)");
    console.log("✅ JurorReputationUpdated and JurorPenalized Events");
    console.log("✅ getJurorReputation Function for Frontend Integration");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });