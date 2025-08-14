'use client';

import { useState } from 'react';
import { keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';

const VotingSystem = ({ 
  cases,
  onCommitVote,
  onRevealVote,
  onExecuteVerdict,
  onAppealCase,
  isConnected,
  account,
  loading
}) => {
  const [voteForm, setVoteForm] = useState({
    caseId: '',
    vote: '1',
    salt: ''
  });
  const [revealForm, setRevealForm] = useState({
    caseId: '',
    vote: '1',
    salt: ''
  });
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // 生成随机盐值
  const generateSalt = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return '0x' + Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // 生成投票哈希 - 使用与智能合约相同的编码方式
  const generateVoteHash = (vote, salt) => {
    try {
      return keccak256(`0x${parseInt(vote).toString(16).padStart(2, '0')}${salt.slice(2)}`);
    } catch (error) {
      console.error('生成投票哈希失败:', error);
      return null;
    }
  };

  const handleCommitVote = async () => {
    if (!voteForm.caseId || !voteForm.vote || !voteForm.salt) {
      alert('请填写所有字段');
      return;
    }

    setIsCommitting(true);
    try {
      await onCommitVote(voteForm.caseId, voteForm.vote, voteForm.salt);
      // 清空表单
      setVoteForm({ caseId: '', vote: '1', salt: '' });
    } catch (error) {
      console.error('提交投票承诺失败:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleRevealVote = async () => {
    if (!revealForm.caseId || !revealForm.vote || !revealForm.salt) {
      alert('请填写所有字段');
      return;
    }

    setIsRevealing(true);
    try {
      await onRevealVote(revealForm.caseId, revealForm.vote, revealForm.salt);
      // 清空表单
      setRevealForm({ caseId: '', vote: '1', salt: '' });
    } catch (error) {
      console.error('揭示投票失败:', error);
    } finally {
      setIsRevealing(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return '投票阶段';
      case 1: return '揭示阶段';
      case 2: return '已解决';
      case 3: return '上诉中';
      case 4: return '最终判决';
      default: return '未知状态';
    }
  };

  const getVoteText = (vote) => {
    return vote === 1 || vote === '1' ? '支持原告' : '支持被告';
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">投票系统</h2>
        <p className="text-gray-600">请先连接钱包</p>
      </div>
    );
  }

  // 过滤出用户可以参与的案件
  const votableCases = cases?.filter(caseItem => {
    // 检查用户是否是该案件的陪审员
    return caseItem.jurors && caseItem.jurors.includes(account);
  }) || [];

  return (
    <div className="space-y-6">
      {/* 案件状态概览 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">我的案件</h2>
        {votableCases.length === 0 ? (
          <p className="text-gray-600">您当前没有需要参与投票的案件</p>
        ) : (
          <div className="space-y-4">
            {votableCases.map((caseItem, index) => (
              <div key={caseItem.id || index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">案件 #{caseItem.id}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    caseItem.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                    caseItem.status === 1 ? 'bg-blue-100 text-blue-800' :
                    caseItem.status === 2 ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(caseItem.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>原告:</strong> <span className="font-mono text-xs">{caseItem.plaintiff}</span></p>
                  <p><strong>被告:</strong> <span className="font-mono text-xs">{caseItem.defendant}</span></p>
                  {caseItem.evidenceCID && (
                    <p><strong>证据:</strong> 
                      <a 
                        href={`https://ipfs.io/ipfs/${caseItem.evidenceCID}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline ml-1"
                      >
                        查看证据
                      </a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 承诺投票 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">承诺投票</h2>
        <p className="text-sm text-gray-600 mb-4">
          在承诺阶段，您需要提交加密的投票。请妥善保存您的投票选择和盐值，在揭示阶段需要使用。
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件ID
            </label>
            <input
              type="number"
              value={voteForm.caseId}
              onChange={(e) => setVoteForm({...voteForm, caseId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入案件ID"
            />
          </div>
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
              随机盐值 (用于隐藏投票)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={voteForm.salt}
                onChange={(e) => setVoteForm({...voteForm, salt: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x1234567890abcdef..."
              />
              <button
                type="button"
                onClick={() => setVoteForm({...voteForm, salt: generateSalt()})}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                生成
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              请务必保存此盐值，揭示投票时需要使用相同的值
            </p>
          </div>
          <button
            onClick={handleCommitVote}
            disabled={isCommitting || loading || !voteForm.caseId || !voteForm.salt}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isCommitting ? '提交中...' : '提交承诺投票'}
          </button>
        </div>
      </div>

      {/* 揭示投票 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">揭示投票</h2>
        <p className="text-sm text-gray-600 mb-4">
          在揭示阶段，您需要提供之前承诺时使用的投票选择和盐值来揭示您的真实投票。
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件ID
            </label>
            <input
              type="number"
              value={revealForm.caseId}
              onChange={(e) => setRevealForm({...revealForm, caseId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入案件ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投票选择 (与承诺时相同)
            </label>
            <select
              value={revealForm.vote}
              onChange={(e) => setRevealForm({...revealForm, vote: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">支持原告</option>
              <option value="2">支持被告</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              随机盐值 (与承诺时相同)
            </label>
            <input
              type="text"
              value={revealForm.salt}
              onChange={(e) => setRevealForm({...revealForm, salt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x1234567890abcdef..."
            />
          </div>
          <button
            onClick={handleRevealVote}
            disabled={isRevealing || loading || !revealForm.caseId || !revealForm.salt}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isRevealing ? '揭示中...' : '揭示投票'}
          </button>
        </div>
      </div>

      {/* 投票说明 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">投票流程说明:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>承诺阶段:</strong> 提交加密的投票，其他人无法看到您的选择</li>
          <li>• <strong>揭示阶段:</strong> 公开您的真实投票，系统验证与承诺的一致性</li>
          <li>• <strong>执行判决:</strong> 根据多数投票结果确定案件胜负</li>
          <li>• <strong>奖励分配:</strong> 投票正确的陪审员将获得奖励</li>
        </ul>
      </div>
    </div>
  );
};

export default VotingSystem;