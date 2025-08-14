# 本地测试网环境配置指南

## 环境变量配置

### 1. 创建环境变量文件

复制示例文件并重命名：
```bash
cp .env.example .env.local
```

### 2. 必需的环境变量

在 `.env.local` 文件中配置以下变量：

#### 网络配置
- `NEXT_PUBLIC_RPC_URL`: 本地测试网RPC端点 (默认: http://localhost:8545)
- `NEXT_PUBLIC_CHAIN_ID`: 链ID (本地测试网默认: 31337)

#### 智能合约地址
- `NEXT_PUBLIC_DECI_COURT_ADDRESS`: DeciCourt合约地址
- `NEXT_PUBLIC_JURY_TOKEN_ADDRESS`: JuryToken合约地址

#### 可选配置
- `NEXT_PUBLIC_BLOCK_EXPLORER_URL`: 区块浏览器URL
- `NEXT_PUBLIC_IPFS_GATEWAY`: IPFS网关地址
- `NEXT_PUBLIC_DEV_MODE`: 开发模式标志

### 3. 获取合约地址

#### 方法一：从部署脚本输出获取
运行智能合约部署脚本后，从控制台输出中复制合约地址。

#### 方法二：从Hardhat网络信息获取
在 `deci_court` 目录下运行：
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. 启动本地测试网

在 `deci_court` 目录下：
```bash
# 启动本地Hardhat网络
npx hardhat node

# 在另一个终端部署合约
npx hardhat run scripts/deploy.js --network localhost
```

### 5. 配置MetaMask

1. 添加本地网络：
   - 网络名称: Local Testnet
   - RPC URL: http://localhost:8545
   - 链ID: 31337
   - 货币符号: ETH

2. 导入测试账户：
   - 使用Hardhat提供的测试账户私钥

### 6. 启动前端应用

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

## 故障排除

### 常见问题

1. **合约地址未配置**
   - 确保 `.env.local` 文件中的合约地址正确
   - 检查合约是否已成功部署

2. **网络连接问题**
   - 确认本地Hardhat网络正在运行
   - 检查RPC_URL配置是否正确

3. **MetaMask连接问题**
   - 确保MetaMask已添加本地网络
   - 检查账户是否有足够的ETH余额

### 调试技巧

- 打开浏览器开发者工具查看控制台错误
- 检查网络请求是否成功
- 验证环境变量是否正确加载