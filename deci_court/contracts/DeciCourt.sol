// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract DeciCourt is ReentrancyGuard {

    // --- Events ---
    event CaseCreated(uint256 indexed caseId, address indexed plaintiff, address indexed defendant, uint256 filingFee);
    event JurorRegistered(address indexed juror, uint256 stakeAmount);
    event JurorUnregistered(address indexed juror);
    event VoteCommitted(uint256 indexed caseId, address indexed juror);
    event VoteRevealed(uint256 indexed caseId, address indexed juror, VoteOption vote);
    event CaseResolved(uint256 indexed caseId, address winner, uint256 plaintiffReward, uint256 defendantReward, uint256 totalJurorReward);
    event AppealInitiated(uint256 indexed caseId, address indexed appellant, uint256 appealDeposit);
    event AppealResolved(uint256 indexed caseId, address winner, bool appealSuccessful);
    event JurorReputationUpdated(address indexed juror, uint256 newReputation, uint256 correctVotes, uint256 totalVotes);
    event JurorPenalized(address indexed juror, uint256 penaltyAmount, uint256 penaltyRate, string reason);


    // --- Enums and Structs ---
    enum CaseStatus { Created, Voting, Resolving, Resolved, Appealing, AppealResolved }
    enum VoteOption { None, ForPlaintiff, ForDefendant }

    struct Case {
        uint256 id;
        address plaintiff;
        address defendant;
        string evidenceCID;         // 用户上传到IPFS的证据CID
        CaseStatus status;
        uint256 filingFee;          // 原告支付的立案费
        address[] jurors;           // 本案的陪审员
        mapping(address => bytes32) committedVotes; // 陪审员的承诺哈希
        mapping(address => VoteOption) revealedVotes; // 陪审员揭示的投票
        uint256 plaintiffVoteCount;
        uint256 defendantVoteCount;
        uint256 creationTime;
        uint256 commitDeadline;     // 承诺截止时间
        uint256 revealDeadline;     // 揭示截止时间
        address winner;
        // Appeal related fields
        address appellant;          // 上诉方
        uint256 appealDeposit;      // 上诉押金
        uint256 appealDeadline;     // 上诉截止时间
        bool isAppealed;            // 是否已上诉
        uint256 appealJurySize;     // 上诉时的陪审团规模
    }

    struct JurorInfo {
        bool isRegistered;
        uint256 stakedAmount;       // 当前质押的总金额
        bool isServing;             // 是否正在审理案件
        uint256 correctVotes;       // 正确投票次数
        uint256 totalVotes;         // 总投票次数
        uint256 reputationScore;    // 声誉分数 (0-100)
        uint256 consecutiveWrong;   // 连续错误投票次数
    }

    // --- State Variables ---
    IERC20 public immutable juryToken; // ERC20代币合约地址

    // Configurable parameters (set in constructor)
    uint256 public filingFeeAmount;     // 固定的立案费用
    uint256 public jurorStakeAmount;    // 成为陪审员需要质押的金额
    uint256 public jurySize;            // 每个案件的陪审员数量
    uint256 public commitDuration;      // 投票承诺阶段时长
    uint256 public revealDuration;      // 投票揭示阶段时长
    uint256 public jurorPenaltyRate;    // 败诉/未投票陪审员的罚款比例 (e.g., 50 for 50%)
    uint256 public appealDepositMultiplier; // 上诉押金倍数 (相对于立案费)
    uint256 public appealDuration;      // 上诉时限
    uint256 public appealJurySize;      // 上诉时的陪审团规模

    // System state
    uint256 public nextCaseId;
    mapping(uint256 => Case) public cases;

    address[] public jurorPool; // 可用的陪审员池，用于随机抽取
    mapping(address => uint256) private jurorPoolIndex; // 用于O(1)删除陪审员
    mapping(address => JurorInfo) public jurorsInfo;

    // --- Constructor ---
    constructor(
        address _tokenAddress,
        uint256 _filingFee,
        uint256 _jurorStake,
        uint256 _jurySize,
        uint256 _commitDuration,
        uint256 _revealDuration,
        uint256 _penaltyRate,
        uint256 _appealDepositMultiplier,
        uint256 _appealDuration,
        uint256 _appealJurySize
    ) {
        juryToken = IERC20(_tokenAddress);
        filingFeeAmount = _filingFee;
        jurorStakeAmount = _jurorStake;
        jurySize = _jurySize;
        commitDuration = _commitDuration;
        revealDuration = _revealDuration;
        jurorPenaltyRate = _penaltyRate; // Should be between 0 and 100
        appealDepositMultiplier = _appealDepositMultiplier; // e.g., 5 for 5x filing fee
        appealDuration = _appealDuration;
        appealJurySize = _appealJurySize; // e.g., 25 for larger jury
        nextCaseId = 1;
    }

    // --- Juror Management Functions ---

    // 陪审员注册，质押一定的金额
    function registerAsJuror() external {
        require(!jurorsInfo[msg.sender].isRegistered, "Already registered");

        // 从调用者地址转移质押代币到本合约
        bool success = juryToken.transferFrom(msg.sender, address(this), jurorStakeAmount);
        require(success, "Token transfer failed. Did you approve?");
        
        jurorsInfo[msg.sender] = JurorInfo({
            isRegistered: true,
            stakedAmount: jurorStakeAmount,
            isServing: false,
            correctVotes: 0,
            totalVotes: 0,
            reputationScore: 50, // 初始声誉分数50
            consecutiveWrong: 0
        });

        // 加入陪审员池
        jurorPool.push(msg.sender);
        jurorPoolIndex[msg.sender] = jurorPool.length - 1;

        emit JurorRegistered(msg.sender, jurorStakeAmount);
    }

    // 陪审员注销，需要质押的金额返回给陪审员
    function unregisterAsJuror() external {
        JurorInfo storage juror = jurorsInfo[msg.sender];
        require(juror.isRegistered, "Not a registered juror");
        require(!juror.isServing, "Cannot unregister while serving on a case");

        // 保存质押金额（在删除之前）
        uint256 stakedAmount = juror.stakedAmount;

        // 从陪审员池中移除 (O(1)操作)
        uint256 indexToRemove = jurorPoolIndex[msg.sender];
        address lastJuror = jurorPool[jurorPool.length - 1];
        jurorPool[indexToRemove] = lastJuror;
        jurorPoolIndex[lastJuror] = indexToRemove;
        jurorPool.pop();

        // 删除信息并退还质押金
        delete jurorsInfo[msg.sender];
        delete jurorPoolIndex[msg.sender];
        
        bool success = juryToken.transfer(msg.sender, stakedAmount);
        require(success, "Token transfer failed");

        emit JurorUnregistered(msg.sender);
    }

    // --- Case Workflow Functions ---
    // 创建案件
    function createCase(address _defendant, string calldata _evidenceCID) external {
        require(_defendant != address(0) && _defendant != msg.sender, "Invalid defendant");
        require(jurorPool.length >= jurySize, "Not enough available jurors");

        // 转移立案费
        bool success = juryToken.transferFrom(msg.sender, address(this), filingFeeAmount);
        require(success, "Filing fee transfer failed. Did you approve?");
        
        uint256 caseId = nextCaseId++;
        Case storage newCase = cases[caseId];
        newCase.id = caseId;
        newCase.plaintiff = msg.sender;
        newCase.defendant = _defendant;
        newCase.evidenceCID = _evidenceCID;
        newCase.status = CaseStatus.Voting; // 直接进入投票阶段
        newCase.filingFee = filingFeeAmount;
        newCase.creationTime = block.timestamp;
        newCase.commitDeadline = block.timestamp + commitDuration;
        newCase.revealDeadline = newCase.commitDeadline + revealDuration;

        _assignJurors(caseId);

        emit CaseCreated(caseId, msg.sender, _defendant, filingFeeAmount);
    }

    // 陪审员承诺投票
    function commitVote(uint256 _caseId, bytes32 _voteHash) external {
        Case storage currentCase = cases[_caseId];
        require(currentCase.status == CaseStatus.Voting, "Not in voting phase");
        require(block.timestamp <= currentCase.commitDeadline, "Commit phase ended");
        require(_isJurorForCase(currentCase, msg.sender), "Not a juror for this case");
        require(currentCase.committedVotes[msg.sender] == bytes32(0), "Already committed");

        currentCase.committedVotes[msg.sender] = _voteHash;
        emit VoteCommitted(_caseId, msg.sender);
    }

    // 陪审员揭示投票
    function revealVote(uint256 _caseId, VoteOption _vote, bytes32 _salt) external {
        Case storage currentCase = cases[_caseId];
        require(currentCase.status == CaseStatus.Voting, "Not in voting phase");
        require(block.timestamp > currentCase.commitDeadline, "Commit phase not ended yet");
        require(block.timestamp <= currentCase.revealDeadline, "Reveal phase ended");
        require(_isJurorForCase(currentCase, msg.sender), "Not a juror for this case");
        require(currentCase.committedVotes[msg.sender] != bytes32(0), "Did not commit");
        require(currentCase.revealedVotes[msg.sender] == VoteOption.None, "Already revealed");
        
        bytes32 regeneratedHash = keccak256(abi.encodePacked(_vote, _salt));
        require(regeneratedHash == currentCase.committedVotes[msg.sender], "Vote does not match commit");

        currentCase.revealedVotes[msg.sender] = _vote;
        if (_vote == VoteOption.ForPlaintiff) {
            currentCase.plaintiffVoteCount++;
        } else if (_vote == VoteOption.ForDefendant) {
            currentCase.defendantVoteCount++;
        }

        emit VoteRevealed(_caseId, msg.sender, _vote);
    }

    // 执行判决
    function executeVerdict(uint256 _caseId) external nonReentrant {
        Case storage currentCase = cases[_caseId];
        require(currentCase.status == CaseStatus.Voting, "Case not ready for verdict");
        require(block.timestamp > currentCase.revealDeadline, "Reveal phase not ended yet");
        
        currentCase.status = CaseStatus.Resolving; // 防止重入

        // 确定胜者，平票则被告胜
        address winner = (currentCase.plaintiffVoteCount > currentCase.defendantVoteCount) ? currentCase.plaintiff : currentCase.defendant;
        currentCase.winner = winner;
        VoteOption winningVote = (winner == currentCase.plaintiff) ? VoteOption.ForPlaintiff : VoteOption.ForDefendant;

        uint256 totalPenaltyPool = 0;
        uint256 winningJurorCount = 0;

        // 计算罚金池和获胜陪审员数量
        for (uint i = 0; i < currentCase.jurors.length; i++) {
            address jurorAddr = currentCase.jurors[i];
            VoteOption jurorVote = currentCase.revealedVotes[jurorAddr];
            JurorInfo storage juror = jurorsInfo[jurorAddr];
            
            // 更新总投票次数
            juror.totalVotes++;

            if (jurorVote == winningVote && jurorVote != VoteOption.None) {
                // 投票正确
                winningJurorCount++;
                juror.correctVotes++;
                juror.consecutiveWrong = 0; // 重置连续错误计数
                
                // 更新声誉分数 (最大100)
                if (juror.reputationScore < 100) {
                    juror.reputationScore = juror.reputationScore + 2;
                    if (juror.reputationScore > 100) {
                        juror.reputationScore = 100;
                    }
                }
                
                emit JurorReputationUpdated(jurorAddr, juror.reputationScore, juror.correctVotes, juror.totalVotes);
            } else {
                // 投错票或未投票的陪审员
                juror.consecutiveWrong++;
                
                // 动态惩罚计算
                uint256 basePenalty = jurorPenaltyRate;
                
                // 新手保护：前3次投票错误减少惩罚
                if (juror.totalVotes <= 3) {
                    basePenalty = basePenalty / 2; // 减半惩罚
                }
                
                // 连续错误增加惩罚
                if (juror.consecutiveWrong > 1) {
                    basePenalty = basePenalty + (juror.consecutiveWrong - 1) * 10;
                    if (basePenalty > 80) basePenalty = 80; // 最大80%惩罚
                }
                
                // 高声誉陪审员减少惩罚
                if (juror.reputationScore > 70) {
                    basePenalty = basePenalty * 80 / 100; // 减少20%惩罚
                }
                
                uint256 penalty = (juror.stakedAmount * basePenalty) / 100;
                juror.stakedAmount = juror.stakedAmount - penalty;
                totalPenaltyPool = totalPenaltyPool + penalty;
                
                // 更新声誉分数 (最小0)
                if (juror.reputationScore > 5) {
                    juror.reputationScore = juror.reputationScore - 5;
                } else {
                    juror.reputationScore = 0;
                }
                
                // 确定惩罚原因
                string memory reason = jurorVote == VoteOption.None ? "No vote" : "Wrong vote";
                emit JurorPenalized(jurorAddr, penalty, basePenalty, reason);
                emit JurorReputationUpdated(jurorAddr, juror.reputationScore, juror.correctVotes, juror.totalVotes);
            }
        }
        
        // 分配资金
        uint256 plaintiffReward = 0;
        uint256 defendantReward = 0;
        uint256 jurorRewardPerPerson = 0;
        uint256 totalJurorReward = 0;

        // 总奖励池 = 原告立案费 + 陪审员罚金池
        uint256 totalRewardPool = currentCase.filingFee + totalPenaltyPool;

        if (winningJurorCount > 0) {
            jurorRewardPerPerson = (totalRewardPool / 2) / winningJurorCount; // 50%的奖励池分给获胜陪审员
        }
        
        if (winner == currentCase.plaintiff) {
            // 原告获胜：退还立案费，并获得奖励池的另一半
            plaintiffReward = currentCase.filingFee + (totalRewardPool / 2);
            juryToken.transfer(currentCase.plaintiff, plaintiffReward);
        } else {
            // 被告获胜：获得奖励池的一半
            defendantReward = totalRewardPool / 2;
            juryToken.transfer(currentCase.defendant, defendantReward);
        }

        // 分配奖励给获胜的陪审员
        for (uint i = 0; i < currentCase.jurors.length; i++) {
            address jurorAddr = currentCase.jurors[i];
            if (currentCase.revealedVotes[jurorAddr] == winningVote) {
                jurorsInfo[jurorAddr].stakedAmount = jurorsInfo[jurorAddr].stakedAmount + jurorRewardPerPerson;
                totalJurorReward = totalJurorReward + jurorRewardPerPerson;
            }
            // 案件结束，解除陪审员的 "isServing" 状态
            jurorsInfo[jurorAddr].isServing = false;
        }

        // 检查是否为上诉案件
        if (currentCase.isAppealed) {
            // 上诉案件的特殊处理
            _handleAppealVerdict(_caseId, winner, plaintiffReward, defendantReward, totalJurorReward);
        } else {
            // 普通案件：设置上诉截止时间，允许败诉方上诉
            currentCase.appealDeadline = block.timestamp + appealDuration;
            currentCase.status = CaseStatus.Resolved;
            emit CaseResolved(_caseId, winner, plaintiffReward, defendantReward, totalJurorReward);
        }
    }

    // 上诉功能
    function appeal(uint256 _caseId) external nonReentrant {
        Case storage currentCase = cases[_caseId];
        require(currentCase.status == CaseStatus.Resolved, "Case not resolved yet");
        require(block.timestamp <= currentCase.appealDeadline, "Appeal deadline passed");
        require(!currentCase.isAppealed, "Case already appealed");
        
        // 只有败诉方可以上诉
        address loser = (currentCase.winner == currentCase.plaintiff) ? currentCase.defendant : currentCase.plaintiff;
        require(msg.sender == loser, "Only losing party can appeal");
        
        // 计算上诉押金
        uint256 requiredDeposit = currentCase.filingFee * appealDepositMultiplier;
        
        // 转移上诉押金
        bool success = juryToken.transferFrom(msg.sender, address(this), requiredDeposit);
        require(success, "Appeal deposit transfer failed");
        
        // 更新案件状态
        currentCase.appellant = msg.sender;
        currentCase.appealDeposit = requiredDeposit;
        currentCase.isAppealed = true;
        currentCase.status = CaseStatus.Appealing;
        currentCase.appealJurySize = appealJurySize;
        
        // 重置投票相关数据
        currentCase.plaintiffVoteCount = 0;
        currentCase.defendantVoteCount = 0;
        
        // 清除之前的陪审员状态
        for (uint i = 0; i < currentCase.jurors.length; i++) {
            address jurorAddr = currentCase.jurors[i];
            delete currentCase.committedVotes[jurorAddr];
            delete currentCase.revealedVotes[jurorAddr];
            jurorsInfo[jurorAddr].isServing = false;
        }
        
        // 清空陪审员数组
        delete currentCase.jurors;
        
        // 重新分配更大规模的陪审团
        _assignAppealJurors(_caseId);
        
        // 设置新的投票时间
        currentCase.commitDeadline = block.timestamp + commitDuration;
        currentCase.revealDeadline = currentCase.commitDeadline + revealDuration;
        currentCase.status = CaseStatus.Voting;
        
        emit AppealInitiated(_caseId, msg.sender, requiredDeposit);
    }

    // --- Internal & View Functions ---
    /**
     * @dev 内部函数：为案件分配陪审员
     */
    function _assignJurors(uint256 _caseId) internal {
        Case storage currentCase = cases[_caseId];
        uint256 poolSize = jurorPool.length;
        
        // 如果陪审员池大小等于所需陪审员数量，直接分配所有陪审员
        if (poolSize == jurySize) {
            for (uint i = 0; i < poolSize; i++) {
                address juror = jurorPool[i];
                currentCase.jurors.push(juror);
                jurorsInfo[juror].isServing = true;
            }
            return;
        }
        
        // 使用更简单的随机选择算法
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _caseId)));
        
        for (uint i = 0; i < jurySize; i++) {
            uint256 randomIndex = (seed + i) % poolSize;
            address selectedJuror = jurorPool[randomIndex];
            
            // 检查是否已经被选中
            bool alreadySelected = false;
            for (uint j = 0; j < currentCase.jurors.length; j++) {
                if (currentCase.jurors[j] == selectedJuror) {
                    alreadySelected = true;
                    break;
                }
            }
            
            if (!alreadySelected) {
                currentCase.jurors.push(selectedJuror);
                jurorsInfo[selectedJuror].isServing = true;
            } else {
                // 如果选中的陪审员已经被分配，尝试下一个
                i--;
                seed = uint256(keccak256(abi.encodePacked(seed, i)));
            }
        }
        
        require(currentCase.jurors.length == jurySize, "Failed to assign enough jurors");
    }
    
    /**
     * @dev 内部函数：为上诉案件分配更大规模的陪审员
     */
    function _assignAppealJurors(uint256 _caseId) internal {
        Case storage currentCase = cases[_caseId];
        uint256 poolSize = jurorPool.length;
        uint256 requiredJurors = currentCase.appealJurySize;
        
        require(poolSize >= requiredJurors, "Not enough available jurors for appeal");
        
        // 如果陪审员池大小等于所需陪审员数量，直接分配所有陪审员
        if (poolSize == requiredJurors) {
            for (uint i = 0; i < poolSize; i++) {
                address juror = jurorPool[i];
                currentCase.jurors.push(juror);
                jurorsInfo[juror].isServing = true;
            }
            return;
        }
        
        // 使用随机选择算法
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _caseId, "appeal")));
        
        for (uint i = 0; i < requiredJurors; i++) {
            uint256 randomIndex = (seed + i) % poolSize;
            address selectedJuror = jurorPool[randomIndex];
            
            // 检查是否已经被选中
            bool alreadySelected = false;
            for (uint j = 0; j < currentCase.jurors.length; j++) {
                if (currentCase.jurors[j] == selectedJuror) {
                    alreadySelected = true;
                    break;
                }
            }
            
            if (!alreadySelected) {
                currentCase.jurors.push(selectedJuror);
                jurorsInfo[selectedJuror].isServing = true;
            } else {
                // 如果选中的陪审员已经被分配，尝试下一个
                i--;
                seed = uint256(keccak256(abi.encodePacked(seed, i)));
            }
        }
        
        require(currentCase.jurors.length == requiredJurors, "Failed to assign enough appeal jurors");
    }
    
    /**
     * @dev 处理上诉案件的判决
     */
    function _handleAppealVerdict(
        uint256 _caseId, 
        address winner, 
        uint256 plaintiffReward, 
        uint256 defendantReward, 
        uint256 totalJurorReward
    ) internal {
        Case storage currentCase = cases[_caseId];
        
        // 判断上诉是否成功（上诉方是否获胜）
        bool appealSuccessful = (winner == currentCase.appellant);
        
        if (appealSuccessful) {
            // 上诉成功：上诉方败诉，失去上诉押金
            if (winner == currentCase.plaintiff) {
                plaintiffReward += (currentCase.appealDeposit / 2);
            } else {
                defendantReward += (currentCase.appealDeposit / 2);
            }
            totalJurorReward += (currentCase.appealDeposit / 2);
        } else {
            // 上诉失败：维持原判，上诉方获得部分押金返还
            juryToken.transfer(currentCase.appellant, currentCase.appealDeposit / 2);
            
            // 剩余押金分给获胜方和陪审员
            if (winner == currentCase.plaintiff) {
                plaintiffReward += (currentCase.appealDeposit / 4);
            } else {
                defendantReward += (currentCase.appealDeposit / 4);
            }
            totalJurorReward += (currentCase.appealDeposit / 4);
        }
        
        currentCase.status = CaseStatus.AppealResolved;
        emit AppealResolved(_caseId, winner, appealSuccessful);
        emit CaseResolved(_caseId, winner, plaintiffReward, defendantReward, totalJurorReward);
    }
    
    /**
     * @dev 检查一个地址是否是指定案件的陪审员
     */
    function _isJurorForCase(Case storage _case, address _addr) internal view returns (bool) {
        for (uint i = 0; i < _case.jurors.length; i++) {
            if (_case.jurors[i] == _addr) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev 获取陪审员的详细声誉信息
     */
    function getJurorReputation(address _juror) external view returns (
         uint256 correctVotes,
         uint256 totalVotes,
         uint256 reputationScore,
         uint256 consecutiveWrong,
         uint256 accuracyRate
     ) {
         JurorInfo storage juror = jurorsInfo[_juror];
         require(juror.isRegistered, "Juror not registered");
         
         correctVotes = juror.correctVotes;
         totalVotes = juror.totalVotes;
         reputationScore = juror.reputationScore;
         consecutiveWrong = juror.consecutiveWrong;
         
         // 计算准确率 (百分比)
         if (totalVotes > 0) {
             accuracyRate = (correctVotes * 100) / totalVotes;
         } else {
             accuracyRate = 0;
         }
     }
     
     /**
     * @dev 获取指定案件的陪审员列表
     */
    function getCaseJurors(uint256 _caseId) external view returns (address[] memory) {
        return cases[_caseId].jurors;
    }

    function getCaseDetails(uint256 _caseId) external view returns (
        uint256 id,
        address plaintiff,
        address defendant,
        string memory evidenceCID,
        CaseStatus status,
        uint256 filingFee,
        uint256 plaintiffVoteCount,
        uint256 defendantVoteCount,
        uint256 creationTime,
        uint256 commitDeadline,
        uint256 revealDeadline,
        address winner
    ) {
        Case storage caseData = cases[_caseId];
        return (
            caseData.id,
            caseData.plaintiff,
            caseData.defendant,
            caseData.evidenceCID,
            caseData.status,
            caseData.filingFee,
            caseData.plaintiffVoteCount,
            caseData.defendantVoteCount,
            caseData.creationTime,
            caseData.commitDeadline,
            caseData.revealDeadline,
            caseData.winner
        );
    }

}