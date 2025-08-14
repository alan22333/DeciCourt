'use client';

import { useState } from 'react';
import { isAddress } from 'viem';
import CaseDetails from './CaseDetails';

const CaseManagement = ({ 
  cases, 
  onCreateCase, 
  onCommitVote,
  onRevealVote,
  onExecuteVerdict,
  onAppealCase,
  isConnected,
  account,
  filingFee 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCase, setNewCase] = useState({
    defendant: '',
    evidenceCID: ''
  });
  const [loadingCases, setLoadingCases] = useState({});
  const [errors, setErrors] = useState({});

  const [voteData, setVoteData] = useState({
    caseId: '',
    vote: '1',
    salt: ''
  });
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  const validateAddress = (address) => {
    if (!address) return '请输入被告地址';
    if (!isAddress(address)) return '请输入有效的以太坊地址';
    if (address.toLowerCase() === account?.toLowerCase()) return '被告地址不能是自己';
    return null;
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // 验证被告地址
    const addressError = validateAddress(newCase.defendant);
    if (addressError) {
      newErrors.defendant = addressError;
    }
    
    // 验证证据CID
    if (!newCase.evidenceCID.trim()) {
      newErrors.evidenceCID = '请输入证据CID';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreateCase(newCase.defendant, newCase.evidenceCID);
      setNewCase({ defendant: '', evidenceCID: '' });
      setShowCreateForm(false);
      setErrors({});
    } finally {
      setIsCreating(false);
    }
  };

  const handleCaseAction = async (caseId, action, ...args) => {
    setLoadingCases(prev => ({ ...prev, [caseId]: action }));
    try {
      switch (action) {
        case 'commit':
          await onCommitVote(caseId, ...args);
          break;
        case 'reveal':
          await onRevealVote(caseId, ...args);
          break;
        case 'execute':
          await onExecuteVerdict(caseId);
          break;
        case 'appeal':
          await onAppealCase(caseId);
          break;
      }
    } finally {
      setLoadingCases(prev => ({ ...prev, [caseId]: null }));
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: '提交阶段',
      1: '揭示阶段', 
      2: '已解决',
      3: '上诉中'
    };
    return statusMap[status] || '未知状态';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: 'bg-blue-100 text-blue-800',
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-purple-100 text-purple-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isConnected) {
    return (
      <div className="neumorphism-card p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">案件管理</h2>
        <p className="text-gray-600 text-xl">请先连接钱包</p>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedCase) {
    return (
      <div className="space-y-8">
        <div className="neumorphism-card p-6">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCase(null);
            }}
            className="neumorphism-nav-button text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2"
          >
            ← 返回案件列表
          </button>
        </div>
        <CaseDetails 
          caseData={selectedCase}
          onCommitVote={onCommitVote}
          onRevealVote={onRevealVote}
          onExecuteVerdict={onExecuteVerdict}
          onAppealCase={onAppealCase}
          isConnected={isConnected}
          account={account}
          loading={loadingCases[selectedCase.index] !== undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 创建案件表单 */}
      <div className="neumorphism-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">案件管理</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="neumorphism-button-primary text-white px-8 py-4 font-bold text-lg transition-all duration-300"
          >
            {showCreateForm ? '取消' : '创建新案件'}
          </button>
        </div>
        {showCreateForm && (
          <div className="mb-8 neumorphism-inset p-6 rounded-lg">
            <h3 className="font-bold mb-6 text-xl text-gray-800">创建新案件</h3>
            <form onSubmit={handleCreateCase} className="space-y-6">

            <div>
              <label className="block text-base font-semibold mb-3 text-gray-700">被告地址 *</label>
              <input
                type="text"
                value={newCase.defendant}
                onChange={(e) => {
                  setNewCase(prev => ({ ...prev, defendant: e.target.value }));
                  if (errors.defendant) {
                    setErrors(prev => ({ ...prev, defendant: null }));
                  }
                }}
                className={`w-full neumorphism-input ${
                  errors.defendant ? 'border-red-500' : ''
                }`}
                placeholder="请输入被告的以太坊地址 (0x...)"
                required
              />
              {errors.defendant && (
                <p className="text-red-500 text-sm mt-1">{errors.defendant}</p>
              )}
            </div>
            <div>
              <label className="block text-base font-semibold mb-3 text-gray-700">证据CID *</label>
              <input
                type="text"
                value={newCase.evidenceCID}
                onChange={(e) => {
                  setNewCase(prev => ({ ...prev, evidenceCID: e.target.value }));
                  if (errors.evidenceCID) {
                    setErrors(prev => ({ ...prev, evidenceCID: null }));
                  }
                }}
                className={`w-full neumorphism-input text-base py-3 ${
                  errors.evidenceCID ? 'border-red-500' : ''
                }`}
                placeholder="请输入IPFS证据CID"
                required
              />
              {errors.evidenceCID && (
                <p className="text-red-500 text-sm mt-1">{errors.evidenceCID}</p>
              )}
            </div>
            {filingFee && (
              <div className="neumorphism-inset p-5 rounded-lg">
                <p className="text-base text-gray-700 font-semibold">
                  创建费用: {filingFee} JURY代币
                </p>
              </div>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isCreating}
                className="neumorphism-button-primary text-white font-bold py-4 px-8 text-lg disabled:opacity-50 transition-all duration-300"
              >
                {isCreating ? '创建中...' : '提交案件'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="neumorphism-button-secondary text-gray-700 font-bold py-4 px-8 text-lg transition-all duration-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>

      {/* 案件列表 */}
      <div className="space-y-6">
        <h3 className="font-bold text-2xl text-gray-900">案件列表</h3>
        {cases && cases.length > 0 ? (
          cases.map((caseItem, index) => (
            <div key={caseItem.id || index} className="neumorphism-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-lg text-gray-800">案件 #{caseItem.id || index}</h4>
                <span className={`neumorphism-badge px-3 py-1 text-sm font-semibold ${
                  caseItem.status === 0 ? 'text-yellow-700' :
                  caseItem.status === 1 ? 'text-blue-700' :
                  caseItem.status === 2 ? 'text-purple-700' :
                  caseItem.status === 3 ? 'text-green-700' :
                  caseItem.status === 4 ? 'text-orange-700' :
                  'text-gray-700'
                }`}>
                  {getStatusText(caseItem.status)}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="neumorphism-inset p-3 rounded-lg">
                    <p className="font-semibold text-gray-600 mb-1">原告:</p>
                    <span className="font-mono text-xs text-gray-800">{caseItem.plaintiff}</span>
                  </div>
                  <div className="neumorphism-inset p-3 rounded-lg">
                    <p className="font-semibold text-gray-600 mb-1">被告:</p>
                    <span className="font-mono text-xs text-gray-800">{caseItem.defendant}</span>
                  </div>
                </div>
                <div className="neumorphism-inset p-3 rounded-lg">
                  <p className="font-semibold text-gray-600">立案费: {caseItem.filingFee ? (caseItem.filingFee / 1e18).toFixed(2) : '0'} JT</p>
                </div>
                {caseItem.evidenceCID && (
                  <div className="neumorphism-inset p-3 rounded-lg">
                    <p className="font-semibold text-gray-600 mb-2">证据CID:</p>
                    <span className="font-mono text-xs text-gray-800 block mb-2">{caseItem.evidenceCID}</span>
                    <a 
                      href={`https://ipfs.io/ipfs/${caseItem.evidenceCID}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="neumorphism-nav-button text-blue-600 hover:text-blue-800 text-xs px-3 py-1 font-medium"
                    >
                      查看证据
                    </a>
                  </div>
                )}
              </div>

              {/* 案件操作按钮 */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedCase({...caseItem, index});
                    setViewMode('detail');
                  }}
                  className="neumorphism-button text-white text-sm px-4 py-2 font-medium transition-all duration-300"
                  style={{background: 'linear-gradient(145deg, #6b7280, #4b5563)'}}
                >
                  查看详情
                </button>
                {caseItem.status === 0 && caseItem.isJuror && (
                  <button
                    onClick={() => {
                      const vote = prompt('请输入您的投票 (0=支持被告, 1=支持原告):');
                      const salt = prompt('请输入随机数 (用于保护投票隐私):');
                      if (vote !== null && salt !== null) {
                        handleCaseAction(index, 'commit', parseInt(vote), salt);
                      }
                    }}
                    disabled={loadingCases[index] === 'commit'}
                    className="neumorphism-button text-white text-sm px-4 py-2 font-medium disabled:opacity-50 transition-all duration-300"
                    style={{background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)'}}
                  >
                    {loadingCases[index] === 'commit' ? '提交中...' : '提交投票'}
                  </button>
                )}
                
                {caseItem.status === 1 && caseItem.isJuror && (
                  <button
                    onClick={() => {
                      const vote = prompt('请输入您之前的投票 (0=支持被告, 1=支持原告):');
                      const salt = prompt('请输入之前使用的随机数:');
                      if (vote !== null && salt !== null) {
                        handleCaseAction(index, 'reveal', parseInt(vote), salt);
                      }
                    }}
                    disabled={loadingCases[index] === 'reveal'}
                    className="neumorphism-button text-white text-sm px-4 py-2 font-medium disabled:opacity-50 transition-all duration-300"
                    style={{background: 'linear-gradient(145deg, #f59e0b, #d97706)'}}
                  >
                    {loadingCases[index] === 'reveal' ? '揭示中...' : '揭示投票'}
                  </button>
                )}
                
                {caseItem.status === 1 && (
                  <button
                    onClick={() => handleCaseAction(index, 'execute')}
                    disabled={loadingCases[index] === 'execute'}
                    className="neumorphism-button text-white text-sm px-4 py-2 font-medium disabled:opacity-50 transition-all duration-300"
                    style={{background: 'linear-gradient(145deg, #10b981, #059669)'}}
                  >
                    {loadingCases[index] === 'execute' ? '执行中...' : '执行判决'}
                  </button>
                )}
                
                {caseItem.status === 2 && caseItem.plaintiff === account && (
                  <button
                    onClick={() => handleCaseAction(index, 'appeal')}
                    disabled={loadingCases[index] === 'appeal'}
                    className="neumorphism-button text-white text-sm px-4 py-2 font-medium disabled:opacity-50 transition-all duration-300"
                    style={{background: 'linear-gradient(145deg, #8b5cf6, #7c3aed)'}}
                  >
                    {loadingCases[index] === 'appeal' ? '上诉中...' : '提起上诉'}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="neumorphism-inset p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg font-medium">暂无案件</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseManagement;