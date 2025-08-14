'use client';

import { useState } from 'react';
import CaseDetails from './CaseDetails';

const MyCases = ({ 
  cases, 
  account,
  onCommitVote,
  onRevealVote,
  onExecuteVerdict,
  onAppealCase,
  isConnected,
  loading
}) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

  // 过滤出用户作为陪审员参与的案件
  const myCases = cases ? cases.filter(caseItem => 
    caseItem.jurors && caseItem.jurors.includes(account)
  ) : [];

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

  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === '0') return '未设置';
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN');
  };

  const getTimeStatus = (caseItem) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const commitDeadline = parseInt(caseItem.commitDeadline || '0');
    const revealDeadline = parseInt(caseItem.revealDeadline || '0');
    
    if (caseItem.status !== 1) return null; // 只在投票阶段显示时间状态
    
    if (currentTime <= commitDeadline) {
      return {
        phase: 'commit',
        text: '承诺阶段',
        color: 'text-blue-600',
        deadline: formatTimestamp(commitDeadline)
      };
    } else if (currentTime <= revealDeadline) {
      return {
        phase: 'reveal',
        text: '揭示阶段',
        color: 'text-green-600',
        deadline: formatTimestamp(revealDeadline)
      };
    } else {
      return {
        phase: 'ended',
        text: '投票已结束',
        color: 'text-red-600',
        deadline: '等待执行判决'
      };
    }
  };

  if (!isConnected) {
    return (
      <div className="neumorphism-card p-6">
        <h2 className="text-3xl font-bold mb-4">我的案件</h2>
        <p className="text-gray-600 text-xl">请先连接钱包</p>
      </div>
    );
  }

  if (viewMode === 'detail' && selectedCase) {
    return (
      <div className="space-y-6">
        <div className="neumorphism-card p-4">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCase(null);
            }}
            className="neumorphism-button-secondary text-sm"
          >
            ← 返回我的案件列表
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
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="neumorphism-card p-6">
        <h2 className="text-3xl font-semibold mb-4 flex items-center">
          <span className="neumorphism-icon mr-3">⚖️</span>
          我的案件
        </h2>
        <p className="text-gray-600 mb-4 text-lg">
          这里显示您作为陪审员参与的所有案件。您可以在相应的时间段内进行投票操作。
        </p>
        
        {myCases.length > 0 ? (
          <div className="space-y-4">
            {myCases.map((caseItem, index) => {
              const timeStatus = getTimeStatus(caseItem);
              
              return (
                <div key={caseItem.id || index} className="neumorphism-card-inner p-4 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-xl">案件 #{caseItem.id}</h4>
                      <span className={`neumorphism-badge text-base font-semibold ${getStatusColor(caseItem.status)}`}>
                        {getStatusText(caseItem.status)}
                      </span>
                    </div>
                    {timeStatus && (
                      <div className="text-right">
                        <p className={`text-sm font-medium ${timeStatus.color}`}>
                          {timeStatus.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          截止: {timeStatus.deadline}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-base text-gray-600 font-semibold">原告:</p>
                      <p className="font-mono text-sm break-all">{caseItem.plaintiff}</p>
                    </div>
                    <div>
                      <p className="text-base text-gray-600 font-semibold">被告:</p>
                      <p className="font-mono text-sm break-all">{caseItem.defendant}</p>
                    </div>
                  </div>
                  
                  {caseItem.evidenceCID && (
                    <div className="mb-4">
                      <p className="text-base text-gray-600 font-semibold">证据:</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{caseItem.evidenceCID}</span>
                        <a 
                          href={`https://ipfs.io/ipfs/${caseItem.evidenceCID}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline text-base font-semibold"
                        >
                          查看证据
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {timeStatus && (
                    <div className="mb-4 p-3 neumorphism-inset">
                      <p className="text-sm font-medium text-gray-700">投票时间信息:</p>
                      <div className="text-xs text-gray-600 mt-1">
                        <p>承诺截止: {formatTimestamp(caseItem.commitDeadline)}</p>
                        <p>揭示截止: {formatTimestamp(caseItem.revealDeadline)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCase(caseItem);
                        setViewMode('detail');
                      }}
                      className="neumorphism-button-primary text-base px-6 py-3 font-semibold"
                    >
                      查看详情并操作
                    </button>
                    
                    {timeStatus && timeStatus.phase === 'commit' && (
                      <span className="neumorphism-indicator inline-flex items-center px-4 py-3 text-base text-blue-700 bg-blue-100 font-semibold">
                        可以提交承诺
                      </span>
                    )}
                    
                    {timeStatus && timeStatus.phase === 'reveal' && (
                      <span className="neumorphism-indicator inline-flex items-center px-4 py-3 text-base text-green-700 bg-green-100 font-semibold">
                        可以揭示投票
                      </span>
                    )}
                    
                    {timeStatus && timeStatus.phase === 'ended' && (
                      <span className="neumorphism-indicator inline-flex items-center px-4 py-3 text-base text-red-700 bg-red-100 font-semibold">
                        投票已结束
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-600 text-xl mb-2 font-semibold">暂无参与的案件</p>
            <p className="text-gray-500 text-base">
              当您被选为陪审员时，相关案件将在这里显示
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCases;