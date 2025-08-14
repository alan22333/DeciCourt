const { ethers } = require("hardhat");

async function main() {
    console.log("开始调试注册陪审员功能...");
    
    // 获取合约地址
    const DECICOURT_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
    const JURY_TOKEN_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
    
    // 获取账户
    const [owner, juror1] = await ethers.getSigners();
    console.log("Owner地址:", owner.address);
    console.log("Juror1地址:", juror1.address);
    
    // 连接到合约
    const JuryToken = await ethers.getContractFactory("JuryToken");
    const DeciCourt = await ethers.getContractFactory("DeciCourt");
    
    const juryToken = JuryToken.attach(JURY_TOKEN_ADDRESS);
    const deciCourt = DeciCourt.attach(DECICOURT_ADDRESS);
    
    console.log("合约连接成功");
    
    // 检查juror1的代币余额
    const balance = await juryToken.balanceOf(juror1.address);
    console.log("Juror1代币余额:", ethers.formatEther(balance));
    
    // 检查授权额度
    const allowance = await juryToken.allowance(juror1.address, DECICOURT_ADDRESS);
    console.log("Juror1授权额度:", ethers.formatEther(allowance));
    
    // 检查质押金额要求
    const jurorStakeAmount = await deciCourt.jurorStakeAmount();
    console.log("质押金额要求:", ethers.formatEther(jurorStakeAmount));
    
    // 检查是否已注册
    const jurorInfo = await deciCourt.jurorsInfo(juror1.address);
    console.log("是否已注册:", jurorInfo.isRegistered);
    
    if (balance < jurorStakeAmount) {
        console.log("错误: 代币余额不足");
        return;
    }
    
    if (allowance < jurorStakeAmount) {
        console.log("需要授权，正在授权...");
        const approveTx = await juryToken.connect(juror1).approve(DECICOURT_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
        console.log("授权完成");
    }
    
    try {
        console.log("尝试注册陪审员...");
        const tx = await deciCourt.connect(juror1).registerAsJuror();
        console.log("交易哈希:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("交易成功，区块号:", receipt.blockNumber);
        
        // 检查事件
        const events = receipt.logs;
        console.log("事件数量:", events.length);
        
        // 检查注册状态
        const updatedJurorInfo = await deciCourt.jurorsInfo(juror1.address);
        console.log("注册成功:", updatedJurorInfo.isRegistered);
        console.log("质押金额:", ethers.formatEther(updatedJurorInfo.stakedAmount));
        
    } catch (error) {
        console.log("注册失败:", error.message);
        if (error.reason) {
            console.log("失败原因:", error.reason);
        }
        if (error.data) {
            console.log("错误数据:", error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });