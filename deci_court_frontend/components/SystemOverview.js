'use client';

const SystemOverview = ({ cases, statistics, jurorInfo, onRegisterAsJuror, onNavigateToCase, loading, getStatusText }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentCases = cases ? cases.slice(0, 5) : [];
  const totalCases = cases ? cases.length : 0;
  const activeCases = cases ? cases.filter(c => c.status === 1).length : 0;
  const completedCases = cases ? cases.filter(c => c.status === 2).length : 0;

  return (
    <div className="space-y-8">
      {/* 欢迎信息 */}
      <div className="neumorphism-card p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎使用 DeciCourt 去中心化法庭系统</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          这是一个基于区块链的去中心化司法系统，通过智能合约和陪审员投票机制确保公正透明的判决。
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="neumorphism-stat-card blue p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="neumorphism-icon w-12 h-12 flex items-center justify-center">
                <span className="text-blue-600 text-xl font-bold">👥</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 mb-1">总陪审员数</p>
              <p className="text-3xl font-bold text-gray-900">{statistics?.totalJurors || 0}</p>
            </div>
          </div>
        </div>

        <div className="neumorphism-stat-card green p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="neumorphism-icon w-12 h-12 flex items-center justify-center">
                <span className="text-green-600 text-xl font-bold">📋</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 mb-1">总案件数</p>
              <p className="text-3xl font-bold text-gray-900">{totalCases}</p>
            </div>
          </div>
        </div>

        <div className="neumorphism-stat-card yellow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="neumorphism-icon w-12 h-12 flex items-center justify-center">
                <span className="text-yellow-600 text-xl font-bold">⏳</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 mb-1">进行中案件</p>
              <p className="text-3xl font-bold text-gray-900">{activeCases}</p>
            </div>
          </div>
        </div>

        <div className="neumorphism-stat-card purple p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="neumorphism-icon w-12 h-12 flex items-center justify-center">
                <span className="text-purple-600 text-xl font-bold">✅</span>
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 mb-1">已完成案件</p>
              <p className="text-3xl font-bold text-gray-900">{completedCases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 最近案件和快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近案件 */}
        <div className="neumorphism-table">
          <div className="neumorphism-table-header px-8 py-6">
            <h3 className="text-xl font-semibold text-gray-900">最近案件</h3>
          </div>
          <div className="p-6">
            {recentCases.length > 0 ? (
              <div className="space-y-4">
                {recentCases.map((caseItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 neumorphism-card-inner rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">案件 #{caseItem.id}</p>
                      <p className="text-sm text-gray-600">
                        原告: {caseItem.plaintiff.slice(0, 6)}...{caseItem.plaintiff.slice(-4)}
                      </p>
                    </div>
                    <span className={`neumorphism-badge px-3 py-1 text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                      {getStatusText(caseItem.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无案件</p>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="neumorphism-card">
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900">快速操作</h3>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {!jurorInfo?.isRegistered && (
                <button
                  onClick={onRegisterAsJuror}
                  disabled={loading}
                  className="w-full neumorphism-button-success text-white font-bold py-5 px-8 text-lg transition-all duration-200"
                >
                  {loading ? '注册中...' : '注册为陪审员'}
                </button>
              )}
              <button
                onClick={onNavigateToCase}
                className="w-full neumorphism-button-primary text-white font-bold py-5 px-8 text-lg transition-all duration-200"
              >
                创建新案件
              </button>
              <div className="text-base text-gray-600 space-y-3 mt-6">
                <p className="flex items-center">
                  <span className="text-blue-500 mr-3">•</span>
                  <span>注册为陪审员需要质押代币</span>
                </p>
                <p className="flex items-center">
                  <span className="text-blue-500 mr-3">•</span>
                  <span>创建案件需要支付申请费</span>
                </p>
                <p className="flex items-center">
                  <span className="text-blue-500 mr-3">•</span>
                  <span>所有操作都在区块链上执行</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="neumorphism-card p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">系统状态</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-5 h-5 bg-green-500 rounded-full neumorphism-indicator"></div>
            <span className="text-base text-gray-700 font-semibold">智能合约运行正常</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-5 h-5 bg-green-500 rounded-full neumorphism-indicator"></div>
            <span className="text-base text-gray-700 font-semibold">区块链网络连接正常</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;