'use client';

const Statistics = ({ 
  totalJurors,
  totalCases,
  activeCases,
  resolvedCases,
  userTokenBalance,
  isConnected 
}) => {
  const stats = [
    {
      label: '总陪审员数',
      value: totalJurors || 0,
      icon: '👥',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      label: '总案件数',
      value: totalCases || 0,
      icon: '📋',
      color: 'bg-green-100 text-green-800'
    },
    {
      label: '进行中案件',
      value: activeCases || 0,
      icon: '⚖️',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      label: '已解决案件',
      value: resolvedCases || 0,
      icon: '✅',
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">系统统计</h2>
      
      {/* 用户代币余额 */}
      {isConnected && userTokenBalance !== undefined && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">您的JURY代币余额</span>
            <span className="text-lg font-bold text-green-600">
              {userTokenBalance} JURY
            </span>
          </div>
        </div>
      )}
      
      {/* 系统统计 */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 系统健康度指标 */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium text-gray-700 mb-2">系统状态</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>陪审员参与率</span>
            <span className={`font-medium ${
              totalJurors > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalJurors > 0 ? '正常' : '需要更多陪审员'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>案件处理效率</span>
            <span className={`font-medium ${
              totalCases > 0 && resolvedCases / totalCases > 0.5 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {totalCases > 0 ? 
                `${Math.round((resolvedCases / totalCases) * 100)}%` : 
                '暂无数据'
              }
            </span>
          </div>
        </div>
      </div>
      
      {/* 提示信息 */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 text-sm">
            💡 连接钱包后可查看您的代币余额和参与记录
          </p>
        </div>
      )}
    </div>
  );
};

export default Statistics;