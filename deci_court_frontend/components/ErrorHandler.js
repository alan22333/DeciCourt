'use client';

const ErrorHandler = ({ error, onClose }) => {
  if (!error) return null;

  // 解析合约错误信息
  const parseContractError = (error) => {
    const errorString = error.toString().toLowerCase();
    
    // DeciCourt 智能合约特定错误
    const contractErrorMappings = {
      'already registered': '您已经注册为陪审员',
      'not a registered juror': '您还未注册为陪审员',
      'cannot unregister while serving': '正在审理案件期间无法注销',
      'invalid defendant': '被告地址无效或与原告相同',
      'not enough available jurors': '可用陪审员不足，无法创建案件',
      'filing fee transfer failed': '立案费支付失败，请检查代币余额和授权',
      'token transfer failed': '代币转账失败，请检查余额和授权',
      'not in voting phase': '案件不在投票阶段',
      'commit phase ended': '投票承诺阶段已结束',
      'commit phase not ended yet': '投票承诺阶段尚未结束',
      'reveal phase ended': '投票揭示阶段已结束',
      'reveal phase not ended yet': '投票揭示阶段尚未结束',
      'not a juror for this case': '您不是此案件的陪审员',
      'already committed': '您已经提交了投票承诺',
      'did not commit': '您尚未提交投票承诺',
      'already revealed': '您已经揭示了投票',
      'vote does not match commit': '投票与承诺不匹配',
      'case not ready for verdict': '案件尚未准备好执行判决',
      'case not resolved yet': '案件尚未解决',
      'appeal deadline passed': '上诉期限已过',
      'case already appealed': '案件已经上诉',
      'only losing party can appeal': '只有败诉方可以上诉',
      'insufficient appeal deposit': '上诉押金不足'
    };
    
    // 通用区块链错误
    const generalErrorMappings = {
      'insufficient funds': '账户余额不足',
      'gas required exceeds allowance': 'Gas费用不足',
      'user denied transaction': '用户拒绝了交易',
      'user rejected': '用户取消了交易',
      'nonce too low': '交易序号过低，请重试',
      'replacement transaction underpriced': '替换交易价格过低',
      'already known': '交易已存在',
      'network error': '网络连接错误',
      'invalid address': '地址格式无效'
    };
    
    // 首先检查合约特定错误
    for (const [key, value] of Object.entries(contractErrorMappings)) {
      if (errorString.includes(key)) {
        return value;
      }
    }
    
    // 然后检查通用错误
    for (const [key, value] of Object.entries(generalErrorMappings)) {
      if (errorString.includes(key)) {
        return value;
      }
    }

    // 如果是网络错误
    if (errorString.includes('chain') || errorString.includes('network')) {
      return '网络错误：请确保连接到正确的网络';
    }

    // 如果是gas相关错误
    if (errorString.includes('gas') || errorString.includes('Gas')) {
      return 'Gas费用不足或Gas限制过低';
    }

    // 如果是nonce错误
    if (errorString.includes('nonce')) {
      return '交易序号错误，请重试';
    }

    // 返回原始错误信息的简化版本
    if (errorString.includes('ContractFunctionExecutionError')) {
      return '合约执行失败，请检查交易参数';
    }

    return error.message || '操作失败，请重试';
  };

  const errorMessage = parseContractError(error);
  const isWarning = errorMessage.includes('不足') || errorMessage.includes('等待');

  return (
    <div className={`fixed top-4 right-4 max-w-md neumorphism-card p-4 z-50 ${
      isWarning ? 'bg-yellow-100 border border-yellow-400' : 'bg-red-100 border border-red-400'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className={`font-bold text-sm mb-2 flex items-center ${
            isWarning ? 'text-yellow-800' : 'text-red-800'
          }`}>
            <span className="neumorphism-icon mr-2">
              {isWarning ? '⚠️' : '❌'}
            </span>
            {isWarning ? '注意' : '错误'}
          </h4>
          <p className={`text-sm ${
            isWarning ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {errorMessage}
          </p>
          
          {/* 显示技术细节（可折叠） */}
          <details className="mt-2">
            <summary className={`text-xs cursor-pointer ${
              isWarning ? 'text-yellow-600' : 'text-red-600'
            }`}>
              技术详情
            </summary>
            <pre className={`text-xs mt-1 p-2 neumorphism-inset overflow-auto max-h-32 ${
              isWarning ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
            }`}>
              {error.toString()}
            </pre>
          </details>
        </div>
        
        <button
          onClick={onClose}
          className={`ml-2 text-lg font-bold neumorphism-button-secondary ${
            isWarning ? 'text-yellow-600 hover:text-yellow-800' : 'text-red-600 hover:text-red-800'
          }`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorHandler;