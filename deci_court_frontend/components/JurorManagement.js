'use client';

import { useState } from 'react';

const JurorManagement = ({ 
  isRegistered, 
  onRegister, 
  onUnregister, 
  isConnected,
  jurorStake 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await onRegister();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    setIsLoading(true);
    try {
      await onUnregister();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="neumorphism-card p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">陪审员管理</h2>
        <p className="text-gray-600 text-xl">请先连接钱包</p>
      </div>
    );
  }

  return (
    <div className="neumorphism-card p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">陪审员管理</h2>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className={`neumorphism-icon w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
            isRegistered ? 'bg-green-500' : 'bg-gray-400'
          }`}></span>
          <span className="font-semibold text-xl text-gray-800">
            状态: {isRegistered ? '已注册陪审员' : '未注册'}
          </span>
        </div>
        
        {jurorStake && (
          <div className="neumorphism-inset p-5 rounded-lg">
            <p className="text-base text-gray-700 font-semibold">
              质押要求: {jurorStake} JURY代币
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {!isRegistered ? (
          <div>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full neumorphism-button-primary text-white font-bold py-5 px-8 text-lg disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? '注册中...' : '注册为陪审员'}
            </button>
            <div className="neumorphism-inset p-5 rounded-lg mt-4">
              <p className="text-base text-gray-700 font-semibold">
                注册后您将有机会参与案件审理并获得奖励
              </p>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleUnregister}
              disabled={isLoading}
              className="w-full neumorphism-button text-white font-bold py-5 px-8 text-lg disabled:opacity-50 transition-all duration-300"
              style={{background: 'linear-gradient(145deg, #ef4444, #dc2626)'}}
            >
              {isLoading ? '注销中...' : '注销陪审员'}
            </button>
            <div className="neumorphism-inset p-5 rounded-lg mt-4">
              <p className="text-base text-gray-700 font-semibold">
                注销后将退还质押的代币（如果没有正在进行的案件）
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 neumorphism-card p-6" style={{background: 'linear-gradient(145deg, #dbeafe, #bfdbfe)'}}>
        <h4 className="font-semibold text-blue-800 mb-4 text-xl">陪审员须知:</h4>
        <ul className="text-base text-blue-700 space-y-3 font-semibold">
          <li className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>需要质押JURY代币作为保证金</li>
          <li className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>参与案件审理可获得奖励</li>
          <li className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>恶意投票将被扣除保证金</li>
          <li className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>审理期间无法注销</li>
        </ul>
      </div>
    </div>
  );
};

export default JurorManagement;