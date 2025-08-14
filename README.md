# 🏛️ DeciCourt - 去中心化法庭系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-orange.svg)](https://hardhat.org/)

> 一个基于区块链的去中心化司法系统，通过智能合约和陪审员投票机制确保公正透明的判决。

## 📖 项目简介

DeciCourt 是一个创新的去中心化法庭系统，旨在通过区块链技术解决传统司法系统中的信任问题。系统采用陪审员投票机制，结合承诺-揭示投票方案，确保投票过程的公正性和透明性。

### 🌟 核心特性

- **🔐 去中心化治理**：基于智能合约的自动化执行
- **⚖️ 陪审员机制**：质押代币成为陪审员，参与案件审理
- **🗳️ 承诺-揭示投票**：防止投票操纵，确保公正性
- **💰 经济激励**：合理的奖惩机制激励诚实参与
- **📱 现代化界面**：基于 Neumorphism 设计的直观用户体验
- **🔍 透明可追溯**：所有操作记录在区块链上，完全透明

## 🖼️ 项目截图

### 系统概览页面
![概览页面](https://pic1.imgdb.cn/item/689db41b58cb8da5c824dee1.png)
*展示系统整体状态、统计信息和快速操作入口*

### 主页界面
![主页](https://pic1.imgdb.cn/item/689db3d858cb8da5c824dded.png)
*简洁现代的主页设计，提供清晰的导航和功能入口*

### 陪审员管理页面
![陪审管理页面](https://pic1.imgdb.cn/item/689db45358cb8da5c824df7d.png)
*陪审员注册、质押管理和相关信息展示*

### 案件展示页面
![案件展示页面](https://pic1.imgdb.cn/item/689db49658cb8da5c824e08b.png)
*案件列表、状态跟踪和详细信息查看*

### 案件处理页面
![案件处理页面](https://pic1.imgdb.cn/item/689db4e058cb8da5c824e198.png)
*案件审理、投票和判决执行界面*

## 🏗️ 技术架构

### 智能合约层
- **Solidity 0.8.19**：主要合约开发语言
- **OpenZeppelin**：安全的合约库
- **Hardhat**：开发、测试和部署框架

### 前端应用层
- **Next.js 14**：React 全栈框架
- **Tailwind CSS**：现代化样式框架
- **Neumorphism Design**：独特的视觉设计风格
- **Web3.js/Ethers.js**：区块链交互库

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm 或 yarn
- MetaMask 钱包

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/DeciCourt.git
cd DeciCourt
```

2. **安装智能合约依赖**
```bash
cd deci_court
npm install
```

3. **部署合约到本地网络**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

4. **安装前端依赖**
```bash
cd ../deci_court_frontend
npm install
```

5. **启动前端应用**
```bash
npm run dev
```

6. **配置 MetaMask**
   - 添加本地网络 (http://localhost:8545)
   - 导入测试账户私钥

### 详细配置

请参考 [SETUP.md](./deci_court_frontend/SETUP.md) 获取完整的环境配置指南。

## 📋 功能模块

### 🏛️ 系统概览
- 实时统计信息展示
- 系统状态监控
- 快速操作入口

### 👨‍⚖️ 陪审员管理
- 陪审员注册/注销
- 代币质押管理
- 声誉系统

### 📋 案件管理
- 案件创建和提交
- 案件状态跟踪
- 证据管理

### 🗳️ 投票系统
- 承诺阶段投票
- 揭示阶段验证
- 结果统计和执行

### 📁 我的案件
- 个人参与案件查看
- 投票历史记录
- 收益统计

## 🔧 开发指南

### 智能合约开发

```bash
# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 生成覆盖率报告
npx hardhat coverage

# 部署到测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 前端开发

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🧪 测试

### 智能合约测试
项目包含完整的单元测试和集成测试：

```bash
cd deci_court
npm test
```

测试覆盖率报告可在 `coverage/` 目录查看。

### 功能测试
- 陪审员注册流程测试
- 案件创建和投票流程测试
- 奖惩机制测试
- 边界条件和异常处理测试

## 🌐 部署

### 测试网部署
1. 配置网络参数
2. 准备部署账户和测试代币
3. 执行部署脚本
4. 验证合约代码

### 主网部署
- 安全审计
- 多重签名钱包配置
- 渐进式部署策略

## 🔧 项目优化方向

### 技术架构优化
- **智能合约优化**
  - 实现更高效的陪审员选择算法，减少随机性偏差
  - 优化投票权重计算，支持动态质押调整
  - 增加案件复杂度评估机制，自动调整陪审员数量
  - 实现渐进式解锁机制，提高资金利用效率

- **前端性能提升**
  - 实现虚拟滚动优化大量案件展示
  - 添加离线缓存功能，提升用户体验
  - 集成 Web3 钱包连接优化，支持更多钱包类型
  - 实现实时通知系统，及时推送案件状态更新

- **安全性增强**
  - 实现多重签名管理员机制
  - 添加时间锁合约防止恶意操作
  - 集成预言机验证外部证据真实性
  - 实现紧急暂停和升级机制

### 功能扩展优化
- **投票机制改进**
  - 支持加权投票和专家意见
  - 实现匿名投票保护隐私
  - 添加投票理由记录和公开机制
  - 支持分阶段投票和中间裁决

- **经济模型优化**
  - 实现动态手续费调整机制
  - 添加陪审员声誉系统和等级制度
  - 支持保险机制降低参与风险
  - 实现收益分享和社区激励

- **用户体验提升**
  - 添加案件模板和智能表单
  - 实现多媒体证据支持
  - 集成法律知识库和智能助手
  - 支持多语言和本地化

## 🌍 应用场景与领域

### 数字资产纠纷
- **DeFi 协议争议**：处理流动性挖矿、借贷协议中的争议
- **NFT 版权纠纷**：解决数字艺术品、收藏品的版权和所有权争议
- **加密货币交易争议**：处理 P2P 交易、OTC 交易中的纠纷
- **智能合约执行争议**：仲裁合约执行结果和参数争议

### 去中心化组织治理
- **DAO 内部争议**：解决去中心化组织内部的治理分歧
- **社区资源分配**：仲裁社区基金、资源分配的争议
- **提案执行争议**：处理治理提案执行过程中的分歧
- **成员权益保护**：保护 DAO 成员的合法权益

### 商业合作纠纷
- **跨境电商争议**：处理国际贸易中的质量、交付争议
- **自由职业者纠纷**：解决远程工作、项目交付的争议
- **知识产权争议**：仲裁专利、商标、版权等知识产权纠纷
- **合作协议争议**：处理商业伙伴间的合作分歧

### 社区治理应用
- **在线社区管理**：处理社区规则违反和用户争议
- **内容创作平台**：解决创作者和平台间的收益分配争议
- **游戏内纠纷**：处理区块链游戏中的资产、规则争议
- **教育认证争议**：仲裁在线教育、技能认证的争议

### 传统行业数字化
- **供应链争议**：处理供应链各环节的质量、交付争议
- **保险理赔争议**：自动化处理保险理赔的争议仲裁
- **房地产交易**：处理数字化房产交易中的争议
- **医疗数据争议**：解决医疗数据使用和隐私保护争议

### 创新应用领域
- **碳排放交易**：仲裁碳信用额度交易中的争议
- **数据确权交易**：处理个人数据使用权的争议
- **虚拟世界治理**：管理元宇宙中的虚拟资产和行为争议
- **AI 模型训练**：解决 AI 训练数据使用和模型权益争议

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范
- 遵循 Solidity 最佳实践
- 编写完整的测试用例
- 保持代码注释清晰
- 遵循项目代码风格

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)。

## 👥 团队

- **核心开发团队**：负责系统架构和核心功能开发
- **安全团队**：专注于智能合约安全和审计
- **产品团队**：用户体验设计和产品规划
- **社区团队**：社区建设和生态发展

## 📞 联系我们

- **项目主页**：[https://github.com/your-username/DeciCourt](https://github.com/your-username/DeciCourt)
- **文档站点**：[https://decicourt.docs.com](https://decicourt.docs.com)
- **社区论坛**：[https://forum.decicourt.com](https://forum.decicourt.com)
- **邮箱**：contact@decicourt.com

## 🙏 致谢

感谢所有为项目做出贡献的开发者、测试者和社区成员。特别感谢：

- OpenZeppelin 团队提供的安全合约库
- Hardhat 团队提供的优秀开发框架
- Next.js 团队提供的强大前端框架
- 所有参与测试和反馈的社区成员

---

**⚖️ DeciCourt - 让司法更公正，让信任更简单**