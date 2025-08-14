'use client';

import { useState } from 'react';
import { formatEther } from 'viem';

const CaseDetails = ({ 
  caseData, 
  onCommitVote,
  onRevealVote,
  onExecuteVerdict,
  onAppealCase,
  isConnected,
  account,
  loading
}) => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteType, setVoteType] = useState('commit'); // 'commit' or 'reveal'
  const [voteForm, setVoteForm] = useState({
    vote: '1',
    salt: ''
  });

  if (!caseData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">请选择一个案件查看详情</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    switch (status) {
      case 0: return '已创建';
      case 1: return '投票阶段';
      case 2: return '判决中';
      case 3: return '已解决';
      case 4: return '上诉中';
      case 5: return '最终判决';
      default: return '未知状态';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-purple-100 text-purple-800';
      case 5: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWinnerText = (winner) => {
    switch (winner) {
      case 1: return '原告胜诉';
      case 2: return '被告胜诉';
      default: return '待定';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return '未设置';
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN');
  };

  const generateSalt = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return '0x' + Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleVoteSubmit = async () => {
    if (!voteForm.vote || !voteForm.salt) {
      alert('请填写所有字段');
      return;
    }

    try {
      if (voteType === 'commit') {
        await onCommitVote(caseData.id, voteForm.vote, voteForm.salt);
      } else {
        await onRevealVote(caseData.id, voteForm.vote, voteForm.salt);
      }
      setShowVoteModal(false);
      setVoteForm({ vote: '1', salt: '' });
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  const isJuror = caseData.jurors && caseData.jurors.includes(account);
  const currentTime = Math.floor(Date.now() / 1000);
  const commitDeadline = parseInt(caseData.commitDeadline || '0');
  const revealDeadline = parseInt(caseData.revealDeadline || '0');
  
  // 时间段控制逻辑
  const isInCommitPhase = currentTime <= commitDeadline;
  const isInRevealPhase = currentTime > commitDeadline && currentTime <= revealDeadline;
  const isAfterRevealPhase = currentTime > revealDeadline;
  
  // 权限控制
  const canCommit = caseData.status === 1 && isJuror && isInCommitPhase;
  const canReveal = caseData.status === 1 && isJuror && isInRevealPhase;
  const canExecute = caseData.status === 1 && isAfterRevealPhase;
  const canAppeal = caseData.status === 3 && (caseData.plaintiff === account || caseData.defendant === account);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 案件标题和状态 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">案件 #{caseData.id}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
            {getStatusText(caseData.status)}
          </span>
        </div>
        {caseData.status >= 2 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">判决结果</p>
            <p className="font-semibold text-lg">{getWinnerText(caseData.winner)}</p>
          </div>
        )}
      </div>

      {/* 案件基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">当事人信息</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">原告:</span>
                <p className="font-mono text-sm break-all">{caseData.plaintiff}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">被告:</span>
                <p className="font-mono text-sm break-all">{caseData.defendant}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">财务信息</h3>
            <p className="text-sm">
              <span className="text-gray-600">立案费:</span>
              <span className="ml-2 font-medium">
                {caseData.filingFee ? formatEther(caseData.filingFee) : '0'} JT
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">时间信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">创建时间:</span>
                <p>{formatTimestamp(caseData.creationTime)}</p>
              </div>
              <div>
                <span className="text-gray-600">投票截止:</span>
                <p>{formatTimestamp(caseData.commitDeadline)}</p>
              </div>
              <div>
                <span className="text-gray-600">揭示截止:</span>
                <p>{formatTimestamp(caseData.revealDeadline)}</p>
              </div>
            </div>
          </div>

          {caseData.evidenceCID && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">证据材料</h3>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {caseData.evidenceCID.slice(0, 10)}...{caseData.evidenceCID.slice(-8)}
                </span>
                <a 
                  href={`https://ipfs.io/ipfs/${caseData.evidenceCID}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline text-sm"
                >
                  查看证据
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 投票统计 */}
      {(caseData.status >= 1) && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">投票统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-600">支持原告</p>
              <p className="text-xl font-bold text-blue-600">
                {caseData.plaintiffVoteCount || 0} 票
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm text-gray-600">支持被告</p>
              <p className="text-xl font-bold text-red-600">
                {caseData.defendantVoteCount || 0} 票
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 陪审员信息 */}
      {caseData.jurors && caseData.jurors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">陪审员 ({caseData.jurors.length}人)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {caseData.jurors.map((juror, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                <span className="font-mono">{juror.slice(0, 6)}...{juror.slice(-4)}</span>
                {juror === account && (
                  <span className="ml-2 text-blue-600 font-medium">(您)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {isConnected && (
        <div className="flex flex-wrap gap-3">
          {canCommit && (
            <button
              onClick={() => {
                setVoteType('commit');
                setShowVoteModal(true);
              }}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              提交投票承诺
            </button>
          )}
          
          {canReveal && (
            <button
              onClick={() => {
                setVoteType('reveal');
                setShowVoteModal(true);
              }}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              揭示投票
            </button>
          )}
          
          {canExecute && (
            <button
              onClick={() => onExecuteVerdict(caseData.id)}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              执行判决
            </button>
          )}
          
          {canAppeal && (
            <button
              onClick={() => onAppealCase(caseData.id)}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              提起上诉
            </button>
          )}
        </div>
      )}

      {/* 投票模态框 */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {voteType === 'commit' ? '提交投票承诺' : '揭示投票'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投票选择
                </label>
                <select
                  value={voteForm.vote}
                  onChange={(e) => setVoteForm({...voteForm, vote: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">支持原告</option>
                  <option value="2">支持被告</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {voteType === 'commit' ? '随机盐值 (用于隐藏投票)' : '随机盐值 (与承诺时相同)'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={voteForm.salt}
                    onChange={(e) => setVoteForm({...voteForm, salt: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0x1234567890abcdef..."
                  />
                  {voteType === 'commit' && (
                    <button
                      type="button"
                      onClick={() => setVoteForm({...voteForm, salt: generateSalt()})}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      生成
                    </button>
                  )}
                </div>
                {voteType === 'commit' && (
                  <p className="text-xs text-gray-500 mt-1">
                    请务必保存此盐值，揭示投票时需要使用相同的值
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowVoteModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
              >
                取消
              </button>
              <button
                onClick={handleVoteSubmit}
                disabled={loading || !voteForm.vote || !voteForm.salt}
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? '提交中...' : (voteType === 'commit' ? '提交承诺' : '揭示投票')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;