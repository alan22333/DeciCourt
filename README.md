# 🏛️ DeciCourt - Decentralized Court System

English | [中文](./README_CN.md)

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-orange.svg)](https://hardhat.org/)

> A blockchain-based decentralized judicial system that ensures fair and transparent judgments through smart contracts and jury voting mechanisms.

## 🎯 Problem Statement

Traditional judicial systems face significant challenges in the digital age:

- **🏛️ Centralized Authority**: Single points of failure and potential corruption
- **💰 High Costs**: Expensive legal proceedings limiting access to justice
- **⏰ Time Inefficiency**: Lengthy court processes and bureaucratic delays
- **🌍 Geographic Limitations**: Cross-border disputes lack unified resolution mechanisms
- **🔒 Lack of Transparency**: Opaque decision-making processes
- **⚖️ Bias and Manipulation**: Human bias and potential for external influence

## 💡 Our Solution

DeciCourt revolutionizes dispute resolution through:

### 🔐 **Decentralized Justice**
- Smart contract-based automated execution eliminates single points of failure
- Transparent, immutable records ensure accountability
- Global accessibility without geographic restrictions

### ⚖️ **Fair Jury System**
- Token-staked jurors with economic incentives for honest participation
- Commit-reveal voting prevents manipulation and collusion
- Reputation-based selection ensures qualified decision-makers

### 💰 **Cost-Effective Resolution**
- Significantly lower costs compared to traditional legal proceedings
- Automated processes reduce administrative overhead
- Direct peer-to-peer dispute resolution

### ⚡ **Rapid Processing**
- Streamlined digital workflows
- Automated case management and execution
- Real-time status tracking and notifications

## 🌟 Core Features

### 🔐 **Decentralized Governance**
- **Smart Contract Automation**: Self-executing contracts with predefined rules
- **Immutable Records**: All decisions permanently recorded on blockchain
- **Transparent Operations**: Public audit trail for all system activities

### ⚖️ **Advanced Jury Mechanism**
- **Token Staking**: Economic commitment ensures serious participation
- **Random Selection**: Cryptographically secure jury assignment
- **Reputation System**: Performance-based juror ranking and rewards

### 🗳️ **Secure Voting System**
- **Commit-Reveal Protocol**: Two-phase voting prevents manipulation
- **Anonymous Voting**: Privacy protection for jurors
- **Weighted Decisions**: Reputation-based vote weighting

### 💰 **Economic Incentive Model**
- **Performance Rewards**: Honest jurors earn token rewards
- **Penalty System**: Dishonest behavior results in stake slashing
- **Dynamic Fees**: Market-driven pricing for dispute resolution

### 📱 **Modern User Experience**
- **Neumorphism Design**: Intuitive and visually appealing interface
- **Mobile Responsive**: Seamless experience across all devices
- **Real-time Updates**: Live case status and notification system

### 🔍 **Complete Transparency**
- **Public Case Registry**: Open access to case information
- **Audit Trail**: Complete history of all actions and decisions
- **Verifiable Results**: Cryptographic proof of fair proceedings

## 🖼️ System Screenshots

### System Overview Dashboard
![Overview Page](https://pic1.imgdb.cn/item/689db41b58cb8da5c824dee1.png)
*Real-time system statistics, active cases, and quick action center*

### Modern Homepage Interface
![Homepage](https://pic1.imgdb.cn/item/689db3d858cb8da5c824dded.png)
*Clean, intuitive design with clear navigation and feature access*

### Jury Management Portal
![Jury Management](https://pic1.imgdb.cn/item/689db45358cb8da5c824df7d.png)
*Comprehensive jury registration, staking, and performance tracking*

### Case Management System
![Case Display](https://pic1.imgdb.cn/item/689db49658cb8da5c824e08b.png)
*Advanced case listing, filtering, and detailed information views*

### Voting & Decision Interface
![Case Processing](https://pic1.imgdb.cn/item/689db4e058cb8da5c824e198.png)
*Secure voting interface with commit-reveal mechanism*

## 🏗️ Technical Architecture

### Blockchain Layer
- **Solidity 0.8.19**: Secure smart contract development
- **OpenZeppelin**: Battle-tested security libraries
- **Hardhat**: Professional development and testing framework
- **EVM Compatible**: Deploy on Ethereum and compatible networks

### Frontend Stack
- **Next.js 14**: Modern React framework with SSR/SSG
- **Tailwind CSS**: Utility-first styling framework
- **Neumorphism Design**: Distinctive visual identity
- **Web3 Integration**: Seamless blockchain connectivity

## 🌍 Use Cases & Applications

### 💎 **Digital Asset Disputes**
- DeFi protocol disagreements and yield farming disputes
- NFT ownership and copyright conflicts
- Cryptocurrency transaction disputes
- Smart contract execution disagreements

### 🏛️ **DAO Governance**
- Internal organizational conflicts
- Resource allocation disputes
- Proposal execution disagreements
- Member rights protection

### 🤝 **Commercial Disputes**
- Cross-border e-commerce conflicts
- Freelancer and remote work disputes
- Intellectual property disagreements
- Partnership and collaboration conflicts

### 🌐 **Community Governance**
- Online platform content disputes
- Creator-platform revenue sharing conflicts
- Gaming asset and rule disputes
- Educational certification disagreements

### 🏭 **Industry Applications**
- Supply chain quality and delivery disputes
- Insurance claim disagreements
- Real estate transaction conflicts
- Healthcare data usage disputes

### 🚀 **Emerging Technologies**
- Carbon credit trading disputes
- Personal data rights conflicts
- Metaverse virtual asset disputes
- AI training data and model rights

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MetaMask or compatible Web3 wallet
- Basic understanding of blockchain concepts

### Quick Setup

1. **Clone Repository**
```bash
git clone https://gitee.com/alan223/deci-court.git
cd DeciCourt
```

2. **Install Dependencies**
```bash
# Smart contracts
cd deci_court && npm install

# Frontend application
cd ../deci_court_frontend && npm install
```

3. **Local Development**
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm run dev
```

4. **Configure Wallet**
- Add local network (http://localhost:8545)
- Import test account for development

For detailed setup instructions, see [SETUP.md](./deci_court_frontend/SETUP.md)

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices and security standards
- Write comprehensive tests for all new features
- Maintain clear code documentation
- Adhere to the project's coding style

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0](LICENSE) - see the license file for details.

**License Summary:**
- ✅ Personal use and learning permitted
- ✅ Modification and distribution allowed
- ✅ Attribution and same license required
- ❌ Commercial use prohibited

## 🙏 Acknowledgments

Special thanks to all contributors, testers, and community members who have helped make DeciCourt possible.

**Lead Developer:** alan223

---

**⚖️ DeciCourt - Making Justice Fairer, Making Trust Simpler**

*Revolutionizing dispute resolution through blockchain technology*