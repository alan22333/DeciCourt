'use client';

import { useState } from 'react';

const WalletConnection = ({ 
  isConnected, 
  account, 
  onConnect, 
  onSwitchNetwork,
  chainId,
  targetChainId 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect();
    } finally {
      setIsConnecting(false);
    }
  };

  const isWrongNetwork = isConnected && chainId !== targetChainId;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">钱包连接</h2>
      
      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">请连接您的钱包以使用DeciCourt</p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isConnecting ? '连接中...' : '连接钱包'}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">已连接账户:</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          
          {isWrongNetwork && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-yellow-700 text-sm mb-2">
                当前网络不正确 (链ID: {chainId})
              </p>
              <button
                onClick={onSwitchNetwork}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded"
              >
                切换到本地测试网
              </button>
            </div>
          )}
          
          <div className="text-green-600 text-sm">
            ✓ 钱包已连接
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;