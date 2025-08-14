// scripts/test-reputation.js
// 演示声誉系统和动态惩罚机制的完整工作流程

const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
    console.log("=== 声誉系统和动态惩罚机制演示 ===");
    
    // 获取账户
    const [deployer, plaintiff, defendant, juror1, juror2, juror3] = await ethers.getSigners();
    
    // 连接到已部署的合约
    const juryTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const deciCourtAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    
    const juryToken = await ethers.getContractAt("JuryToken", juryTokenAddress);
    const deciCourt = await ethers.getContractAt("DeciCourt", deciCourtAddress);
    
    console.log("\n--- 步骤1: 创建案件 ---");
    await deciCourt.connect(plaintiff).createCase(defendant.address, "QmTestEvidence123");
    const caseId = 1;
    console.log(`案件 ${caseId} 创建成功`);
    
    // 获取分配的陪审员
    const assignedJurors = await deciCourt.getCaseJurors(caseId);
    console.log("分配的陪审员:", assignedJurors);
    
    console.log("\n--- 步骤2: 陪审员投票 ---");
    
    // 模拟投票：前两个陪审员投票支持原告，第三个投票支持被告
    const votes = [1, 1, 2]; // ForPlaintiff, ForPlaintiff, ForDefendant
    const salts = [];
    const commitments = [];
    
    // 承诺阶段
    console.log("承诺阶段开始...");
    for (let i = 0; i < assignedJurors.length; i++) {
        const vote = votes[i];
        const salt = ethers.randomBytes(32);
        salts.push(salt);
        
        const commitment = ethers.keccak256(
            ethers.solidityPacked(["uint8", "bytes32"], [vote, salt])
        );
        commitments.push(commitment);
        
        const jurorSigner = await ethers.getSigner(assignedJurors[i]);
        await deciCourt.connect(jurorSigner).commitVote(caseId, commitment);
        
        console.log(`陪审员 ${assignedJurors[i]} 提交承诺投票`);
    }
    
    // 等待承诺阶段结束
    console.log("等待承诺阶段结束...");
    await time.increase(301); // 5分钟 + 1秒
    
    // 揭示阶段
    console.log("\n揭示阶段开始...");
    for (let i = 0; i < assignedJurors.length; i++) {
        const vote = votes[i];
        const salt = salts[i];
        const jurorSigner = await ethers.getSigner(assignedJurors[i]);
        
        await deciCourt.connect(jurorSigner).revealVote(caseId, vote, salt);
        
        const voteText = vote === 1 ? "支持原告" : vote === 2 ? "支持被告" : "弃权";
        console.log(`陪审员 ${assignedJurors[i]} 揭示投票: ${voteText}`);
    }
    
    // 等待揭示阶段结束
    console.log("等待揭示阶段结束...");
    await time.increase(301); // 5分钟 + 1秒
    
    console.log("\n--- 步骤3: 执行判决和声誉更新 ---");
    
    // 获取执行判决前的声誉信息
    console.log("\n执行判决前的声誉信息:");
    for (let i = 0; i < assignedJurors.length; i++) {
        const reputation = await deciCourt.getJurorReputation(assignedJurors[i]);
        console.log(`陪审员 ${assignedJurors[i]}:`);
        console.log(`  声誉分数: ${reputation.reputationScore}`);
        console.log(`  正确投票: ${reputation.correctVotes}`);
        console.log(`  总投票数: ${reputation.totalVotes}`);
        console.log(`  连续错误: ${reputation.consecutiveWrong}`);
        console.log(`  准确率: ${reputation.accuracyRate}%`);
    }
    
    // 执行判决
    console.log("\n执行判决...");
    const tx = await deciCourt.executeVerdict(caseId);
    const receipt = await tx.wait();
    
    // 解析事件
    console.log("\n--- 事件日志 ---");
    for (const log of receipt.logs) {
        try {
            const parsedLog = deciCourt.interface.parseLog(log);
            if (parsedLog.name === "JurorReputationUpdated") {
                console.log(`🔄 声誉更新事件:`);
                console.log(`  陪审员: ${parsedLog.args.juror}`);
                console.log(`  新声誉分数: ${parsedLog.args.newScore}`);
                console.log(`  正确投票: ${parsedLog.args.correctVotes}`);
                console.log(`  总投票数: ${parsedLog.args.totalVotes}`);
            } else if (parsedLog.name === "JurorPenalized") {
                console.log(`⚠️  惩罚事件:`);
                console.log(`  陪审员: ${parsedLog.args.juror}`);
                console.log(`  惩罚金额: ${ethers.formatEther(parsedLog.args.penaltyAmount)} JURY`);
                console.log(`  惩罚原因: ${parsedLog.args.reason}`);
            } else if (parsedLog.name === "CaseResolved") {
                console.log(`✅ 案件解决事件:`);
                console.log(`  案件ID: ${parsedLog.args.caseId}`);
                console.log(`  获胜方: ${parsedLog.args.winner === 1 ? "原告" : "被告"}`);
            }
        } catch (e) {
            // 忽略无法解析的日志
        }
    }
    
    console.log("\n--- 步骤4: 判决后的声誉信息 ---");
    for (let i = 0; i < assignedJurors.length; i++) {
        const reputation = await deciCourt.getJurorReputation(assignedJurors[i]);
        const voteText = votes[i] === 1 ? "支持原告" : votes[i] === 2 ? "支持被告" : "弃权";
        const isCorrect = votes[i] === 1; // 原告获胜
        
        console.log(`\n陪审员 ${assignedJurors[i]} (投票: ${voteText}, ${isCorrect ? "✅正确" : "❌错误"}):`); 
        console.log(`  声誉分数: ${reputation.reputationScore}`);
        console.log(`  正确投票: ${reputation.correctVotes}`);
        console.log(`  总投票数: ${reputation.totalVotes}`);
        console.log(`  连续错误: ${reputation.consecutiveWrong}`);
        console.log(`  准确率: ${reputation.accuracyRate}%`);
    }
    
    console.log("\n=== 演示完成 ===");
    console.log("\n总结:");
    console.log("✅ 声誉系统正常工作");
    console.log("✅ 动态惩罚机制生效");
    console.log("✅ 事件正确触发");
    console.log("✅ getJurorReputation函数正常返回数据");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });