'use client';

import { useState, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther, keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';
import { mainnet, sepolia, localhost } from 'viem/chains';

// 导入组件
import Navbar from '../components/Navbar';
import WalletConnection from '../components/WalletConnection';
import ErrorHandler from '../components/ErrorHandler';
import SystemOverview from '../components/SystemOverview';
import JurorManagement from '../components/JurorManagement';
import CaseManagement from '../components/CaseManagement';
import Statistics from '../components/Statistics';

import MyCases from '../components/MyCases';

// 导入合约配置
import { 
  DECICOURT_ABI, 
  JURY_TOKEN_ABI, 
  CONTRACT_CONFIG,
  CASE_STATUS,
  VOTE_OPTION 
} from '../config/contracts';

// 解构合约配置
const { 
  DECICOURT_ADDRESS, 
  JURY_TOKEN_ADDRESS, 
  RPC_URL, 
  CHAIN_ID 
} = CONTRACT_CONFIG;

export default function Home() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [publicClient, setPublicClient] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [caseList, setCaseList] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [statistics, setStatistics] = useState({
    totalJurors: 0,
    totalCases: 0,
    activeCases: 0,
    resolvedCases: 0,
    userTokenBalance: 0
  });
  const [contractParams, setContractParams] = useState({
    filingFee: '0',
    jurorStake: '0'
  });
  const [jurorInfo, setJurorInfo] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [cases, setCases] = useState([]);
  const [createCaseForm, setCreateCaseForm] = useState({
    defendant: '',
    evidenceCID: ''
  });

  useEffect(() => {
    initializeClients();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      loadUserData();
      loadSystemInfo();
      loadStatistics();
      loadContractParams();
    }
  }, [isConnected, account]);

  useEffect(() => {
    if (systemInfo) {
      loadCases();
    }
  }, [systemInfo]);

  // 监听账户变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // 用户断开连接
          setIsConnected(false);
          setAccount('');
          setTokenBalance(0);
          setJurorInfo(null);
          setCases([]);
          setSystemInfo(null);
          setStatistics(null);
        } else if (accounts[0] !== account) {
          // 账户发生变化
          setAccount(accounts[0]);
          setIsConnected(true);
          // 重新加载数据
          if (publicClient) {
            try {
              // 获取陪审员信息
              const jurorData = await publicClient.readContract({
                address: DECICOURT_ADDRESS,
                abi: DECICOURT_ABI,
                functionName: 'jurorsInfo',
                args: [accounts[0]]
              });
              setJurorInfo({
                isRegistered: jurorData[0],
                stakedAmount: jurorData[1],
                isServing: jurorData[2]
              });

              // 获取代币余额
              const balance = await publicClient.readContract({
                address: JURY_TOKEN_ADDRESS,
                abi: JURY_TOKEN_ABI,
                functionName: 'balanceOf',
                args: [accounts[0]]
              });
              setTokenBalance(formatEther(balance));
            } catch (error) {
              console.error('Failed to load user data:', error);
            }
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // 清理函数
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account, publicClient]);

  const initializeClients = async () => {
    try {
      setError(null);
      const customChain = {
        id: CHAIN_ID,
        name: 'Local Testnet',
        network: 'localhost',
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: {
            http: [RPC_URL],
          },
          public: {
            http: [RPC_URL],
          },
        },
      };

      const publicClient = createPublicClient({
        chain: customChain,
        transport: http(RPC_URL)
      });
      setPublicClient(publicClient);

      if (typeof window !== 'undefined' && window.ethereum) {
        const walletClient = createWalletClient({
          chain: customChain,
          transport: custom(window.ethereum)
        });
        setWalletClient(walletClient);
      }
    } catch (error) {
      console.error('Failed to initialize clients:', error);
      setError('初始化客户端失败: ' + error.message);
    }
  };

  const switchToLocalNetwork = async () => {
    try {
      // 尝试切换到本地网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError) {
      // 如果网络不存在，添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: 'Local Testnet',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [RPC_URL],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    try {
      setError(null);
      if (!walletClient) {
        setError('请安装 MetaMask');
        return;
      }

      const accounts = await walletClient.requestAddresses();
      if (accounts.length > 0) {
        // 检查当前网络
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        
        if (currentChainId !== CHAIN_ID) {
          setMessage(`当前网络不正确，正在切换到本地测试网...`);
          await switchToLocalNetwork();
        }
        
        setAccount(accounts[0]);
        setIsConnected(true);
        setMessage('钱包连接成功');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('连接钱包失败: ' + error.message);
    }
  };

  const loadUserData = async () => {
    try {
      if (!publicClient || !account) return;

      // 获取陪审员信息
      const jurorData = await publicClient.readContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'jurorsInfo',
        args: [account]
      });
      setJurorInfo({
        isRegistered: jurorData[0],
        stakedAmount: jurorData[1],
        isServing: jurorData[2]
      });

      // 获取代币余额
      const balance = await publicClient.readContract({
        address: JURY_TOKEN_ADDRESS,
        abi: JURY_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [account]
      });
      setTokenBalance(formatEther(balance));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      if (!publicClient) return;

      const [filingFee, jurorStake, nextCaseId] = await Promise.all([
        publicClient.readContract({
          address: DECICOURT_ADDRESS,
          abi: DECICOURT_ABI,
          functionName: 'filingFeeAmount'
        }),
        publicClient.readContract({
          address: DECICOURT_ADDRESS,
          abi: DECICOURT_ABI,
          functionName: 'jurorStakeAmount'
        }),
        publicClient.readContract({
          address: DECICOURT_ADDRESS,
          abi: DECICOURT_ABI,
          functionName: 'nextCaseId'
        })
      ]);

      setSystemInfo({
        filingFee: formatEther(filingFee),
        jurorStake: formatEther(jurorStake),
        nextCaseId: nextCaseId.toString()
      });
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const loadCases = async () => {
    try {
      if (!publicClient || !systemInfo) return;

      const caseList = [];
      const totalCases = parseInt(systemInfo.nextCaseId) - 1;
      
      for (let i = 1; i <= Math.min(totalCases, 10); i++) {
        try {
          const [caseDetails, jurors] = await Promise.all([
            publicClient.readContract({
              address: DECICOURT_ADDRESS,
              abi: DECICOURT_ABI,
              functionName: 'getCaseDetails',
              args: [BigInt(i)]
            }),
            publicClient.readContract({
              address: DECICOURT_ADDRESS,
              abi: DECICOURT_ABI,
              functionName: 'getCaseJurors',
              args: [BigInt(i)]
            })
          ]);
          
          caseList.push({
            id: caseDetails[0].toString(),
            plaintiff: caseDetails[1],
            defendant: caseDetails[2],
            evidenceCID: caseDetails[3],
            status: caseDetails[4],
            filingFee: formatEther(caseDetails[5]),
            plaintiffVoteCount: caseDetails[6].toString(),
            defendantVoteCount: caseDetails[7].toString(),
            creationTime: caseDetails[8].toString(),
            commitDeadline: caseDetails[9].toString(),
            revealDeadline: caseDetails[10].toString(),
            winner: caseDetails[11],
            jurors: jurors
          });
        } catch (error) {
          console.error(`Failed to load case ${i}:`, error);
        }
      }
      
      setCases(caseList);
      
      // 更新统计数据
      const activeCases = caseList.filter(c => c.status < 3).length;
      const resolvedCases = caseList.filter(c => c.status === 3).length;
      setStatistics(prev => ({
        ...prev,
        totalCases: totalCases,
        activeCases,
        resolvedCases
      }));
    } catch (error) {
      console.error('Failed to load cases:', error);
      setError('加载案件失败: ' + error.message);
    }
  };

  // 获取统计数据
  const loadStatistics = async () => {
    try {
      // 获取陪审员总数（这里需要根据实际合约实现调整）
      // 暂时使用模拟数据
      setStatistics(prev => ({
        ...prev,
        totalJurors: 5 // 这里应该从合约获取实际数据
      }));
      
      // 获取用户代币余额
      if (account) {
        const balance = await publicClient.readContract({
          address: JURY_TOKEN_ADDRESS,
          abi: JURY_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [account],
        });
        setStatistics(prev => ({
          ...prev,
          userTokenBalance: formatEther(balance)
        }));
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // 获取合约参数
  const loadContractParams = async () => {
    try {
      const filingFee = await publicClient.readContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'filingFeeAmount',
      });
      
      const jurorStake = await publicClient.readContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'jurorStakeAmount',
      });
      
      setContractParams({
        filingFee: formatEther(filingFee),
        jurorStake: formatEther(jurorStake)
      });
    } catch (error) {
      console.error('Failed to load contract params:', error);
    }
  };

  const checkAndSwitchNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== CHAIN_ID) {
        setMessage('网络不正确，正在切换到本地测试网...');
        await switchToLocalNetwork();
        // 等待网络切换完成
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const registerAsJuror = async () => {
     try {
       setError(null);
       setLoading(true);
       
       // 检查并切换网络
       await checkAndSwitchNetwork();
       
       // 首先授权代币
       const approveHash = await walletClient.writeContract({
         address: JURY_TOKEN_ADDRESS,
         abi: JURY_TOKEN_ABI,
         functionName: 'approve',
         args: [DECICOURT_ADDRESS, parseEther(systemInfo.jurorStake)],
         account
       });
       
       await publicClient.waitForTransactionReceipt({ hash: approveHash });
       
       // 注册为陪审员
       const registerHash = await walletClient.writeContract({
         address: DECICOURT_ADDRESS,
         abi: DECICOURT_ABI,
         functionName: 'registerAsJuror',
         account
       });
       
       await publicClient.waitForTransactionReceipt({ hash: registerHash });
       setMessage('注册陪审员成功');
       await loadUserData();
       await loadStatistics();
     } catch (error) {
       console.error('Failed to register as juror:', error);
       setError('注册陪审员失败: ' + error.message);
     } finally {
       setLoading(false);
     }
   };

  const unregisterAsJuror = async () => {
    try {
      setError(null);
      setLoading(true);
      
      await checkAndSwitchNetwork();
      
      const hash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'unregisterAsJuror',
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage('注销陪审员成功');
      await loadUserData();
      await loadStatistics();
    } catch (error) {
      console.error('Failed to unregister as juror:', error);
      setError('注销陪审员失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (defendant, evidenceCID) => {
    try {
      setError(null);
      setLoading(true);
      
      // 验证输入参数
      if (!defendant || !evidenceCID) {
        throw new Error('被告地址和证据CID不能为空');
      }
      
      // 验证地址格式
      if (!defendant.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('被告地址格式不正确，请输入有效的以太坊地址');
      }
      
      // 检查被告地址不能是自己
      if (defendant.toLowerCase() === account.toLowerCase()) {
        throw new Error('被告地址不能是自己的地址');
      }
      
      // 检查并切换网络
      await checkAndSwitchNetwork();
      
      // 获取当前立案费
      const filingFeeWei = await publicClient.readContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'filingFeeAmount'
      });
      
      // 首先授权立案费
      const approveHash = await walletClient.writeContract({
        address: JURY_TOKEN_ADDRESS,
        abi: JURY_TOKEN_ABI,
        functionName: 'approve',
        args: [DECICOURT_ADDRESS, filingFeeWei],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      
      // 创建案件
      const createHash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'createCase',
        args: [defendant, evidenceCID],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash: createHash });
      setMessage('案件创建成功');
      await loadCases();
      await loadStatistics();
    } catch (error) {
      console.error('Failed to create case:', error);
      // 解析具体的错误信息
      let errorMessage = '案件创建失败';
      if (error.message.includes('Invalid defendant')) {
        errorMessage = '被告地址无效';
      } else if (error.message.includes('Not enough available jurors')) {
        errorMessage = '可用陪审员不足，无法创建案件';
      } else if (error.message.includes('Filing fee transfer failed')) {
        errorMessage = '立案费支付失败，请检查代币余额和授权';
      } else if (error.message.includes('User rejected')) {
        errorMessage = '用户取消了交易';
      } else {
        errorMessage = '案件创建失败: ' + error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const commitVote = async (caseId, vote, salt) => {
    try {
      setError(null);
      setLoading(true);
      
      // 检查并切换网络
      await checkAndSwitchNetwork();
      
      // 生成投票哈希 - 使用与智能合约相同的编码方式
      const voteHash = keccak256(`0x${parseInt(vote).toString(16).padStart(2, '0')}${salt.slice(2)}`);
      
      const hash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'commitVote',
        args: [BigInt(caseId), voteHash],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage('投票承诺提交成功');
      await loadCases();
    } catch (error) {
      console.error('Failed to commit vote:', error);
      setError('投票承诺提交失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const revealVote = async (caseId, vote, salt) => {
    try {
      setError(null);
      setLoading(true);
      
      // 检查并切换网络
      await checkAndSwitchNetwork();
      
      const hash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'revealVote',
        args: [BigInt(caseId), parseInt(vote), salt],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage('投票揭示成功');
      await loadCases();
    } catch (error) {
      console.error('Failed to reveal vote:', error);
      setError('投票揭示失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const executeVerdict = async (caseId) => {
    try {
      setError(null);
      setLoading(true);
      
      // 检查并切换网络
      await checkAndSwitchNetwork();
      
      const hash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'executeVerdict',
        args: [BigInt(caseId)],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      setMessage('判决执行成功');
      await loadCases();
      await loadStatistics();
    } catch (error) {
      console.error('Failed to execute verdict:', error);
      setError('判决执行失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const appealCase = async (caseId) => {
    try {
      setError(null);
      setLoading(true);
      
      // 检查并切换网络
      await checkAndSwitchNetwork();
      
      // 计算上诉押金 (假设是立案费的5倍)
      const appealDeposit = parseEther((parseFloat(systemInfo.filingFee) * 5).toString());
      
      // 首先授权上诉押金
      const approveHash = await walletClient.writeContract({
        address: JURY_TOKEN_ADDRESS,
        abi: JURY_TOKEN_ABI,
        functionName: 'approve',
        args: [DECICOURT_ADDRESS, appealDeposit],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      
      // 提起上诉
      const appealHash = await walletClient.writeContract({
        address: DECICOURT_ADDRESS,
        abi: DECICOURT_ABI,
        functionName: 'appeal',
        args: [BigInt(caseId)],
        account
      });
      
      await publicClient.waitForTransactionReceipt({ hash: appealHash });
      setMessage('上诉提交成功');
      await loadCases();
      await loadStatistics();
    } catch (error) {
      console.error('Failed to appeal case:', error);
      setError('上诉提交失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: '已创建',
      1: '投票中',
      2: '判决中',
      3: '已判决',
      4: '上诉中',
      5: '上诉已判决'
    };
    return statusMap[status] || '未知状态';
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
          {/* 连接钱包区域 */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">连接您的钱包</h2>
                <p className="text-gray-600">请连接您的钱包以使用 DeciCourt 系统</p>
              </div>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? '连接中...' : '连接钱包'}
              </button>
              {message && (
                <p className="mt-4 text-sm text-gray-600">{message}</p>
              )}
            </div>
          </div>

          {/* 系统规则说明 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">DeciCourt 去中心化法庭系统</h2>
              <p className="text-lg text-gray-600">基于区块链的公平、透明、去中心化争议解决平台</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 系统概述 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  系统概述
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>去中心化争议解决：无需传统法院，通过区块链智能合约自动执行</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>陪审员制度：社区成员质押代币成为陪审员，参与案件审理</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>透明公正：所有流程记录在区块链上，确保透明度和不可篡改性</span>
                  </li>
                </ul>
              </div>

              {/* 参与流程 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  参与流程
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">1</span>
                    <span>质押 500 JURY 代币注册成为陪审员</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">2</span>
                    <span>原告支付 100 JURY 立案费创建案件</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">3</span>
                    <span>系统随机选择 3 名陪审员审理案件</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-3 mt-0.5">4</span>
                    <span>陪审员秘密投票，然后公开揭示投票</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 声誉系统 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  声誉系统
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>初始声誉分数：50分（满分100分）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>正确投票：声誉分数+2，连续错误投票次数清零</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>错误投票：声誉分数-5，连续错误投票次数+1</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>声誉影响惩罚力度：高声誉陪审员享受惩罚减免</span>
                  </li>
                </ul>
              </div>

              {/* 动态惩罚机制 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  动态惩罚机制
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>基础惩罚：错误投票或未投票扣除质押金额的50%</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>新手保护：前3次投票惩罚减半（25%）</span>
                  </li>
                  <li className="flex items-start">
                     <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                     <span>声誉奖励：声誉&gt;70分的陪审员惩罚减少10%</span>
                   </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>连续错误：每次连续错误增加10%惩罚（最高80%）</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 奖励机制 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  奖励机制
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>正确投票的陪审员平分50%的奖励池</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>奖励池 = 立案费 + 错误陪审员的惩罚金</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>胜诉方获得剩余50%的奖励池</span>
                  </li>
                </ul>
              </div>

              {/* 上诉机制 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  上诉机制
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>败诉方可在判决后提起上诉</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>上诉需支付5倍立案费作为押金</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>上诉案件由更多陪审员重新审理</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 neumorphism-card-inner">
              <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                <span className="text-2xl mr-3">💡</span>
                重要提示
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start text-base">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>请确保您有足够的 JURY 代币参与系统</span>
                </li>
                <li className="flex items-start text-base">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>陪审员需要认真审理案件，恶意投票将面临经济损失</span>
                </li>
                <li className="flex items-start text-base">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>所有交易都在区块链上执行，请仔细确认操作</span>
                </li>
                <li className="flex items-start text-base">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>系统采用承诺-揭示投票机制，确保投票的公正性</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <SystemOverview
            cases={cases}
            statistics={statistics}
            jurorInfo={jurorInfo}
            onRegisterAsJuror={registerAsJuror}
            onNavigateToCase={() => setActiveTab('case')}
            loading={loading}
            getStatusText={getStatusText}
          />
        );
      case 'juror':
        return (
          <JurorManagement
            isRegistered={jurorInfo?.isRegistered || false}
            onRegister={registerAsJuror}
            onUnregister={unregisterAsJuror}
            isConnected={isConnected}
            jurorStake={contractParams.jurorStake}
          />
        );
      case 'case':
        return (
          <CaseManagement
            cases={cases}
            onCreateCase={(defendant, evidence) => {
              createCase(defendant, evidence);
            }}
            onCommitVote={commitVote}
            onRevealVote={revealVote}
            onExecuteVerdict={executeVerdict}
            onAppealCase={appealCase}
            isConnected={isConnected}
            account={account}
            filingFee={contractParams.filingFee}
          />
        );

      case 'mycases':
        return (
          <MyCases
            cases={cases}
            account={account}
            onCommitVote={commitVote}
            onRevealVote={revealVote}
            onExecuteVerdict={executeVerdict}
            onAppealCase={appealCase}
            isConnected={isConnected}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen neumorphism-bg">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        account={account}
        onConnect={connectWallet}
        isJuror={jurorInfo?.isRegistered || false}
        tokenBalance={tokenBalance}
      />
      
      <ErrorHandler error={error} onClear={() => setError('')} />
      
      {message && (
        <div className="neumorphism-card mx-4 mt-4 bg-green-50 border border-green-200 text-green-700">
          {message}
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {renderContent()}
       </main>
    </div>
  );
}
