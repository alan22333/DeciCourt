# 🏛️ DeciCourt - Decentralized Court System

English | [中文](./README.md)

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-orange.svg)](https://hardhat.org/)

> A blockchain-based decentralized judicial system that ensures fair and transparent judgments through smart contracts and jury voting mechanisms.

## 📖 Project Overview

DeciCourt is an innovative decentralized court system designed to solve trust issues in traditional judicial systems through blockchain technology. The system employs a jury voting mechanism combined with commit-reveal voting schemes to ensure fairness and transparency in the voting process.

### 🌟 Core Features

- **🔐 Decentralized Governance**: Automated execution based on smart contracts
- **⚖️ Jury Mechanism**: Stake tokens to become jurors and participate in case trials
- **🗳️ Commit-Reveal Voting**: Prevents vote manipulation and ensures fairness
- **💰 Economic Incentives**: Reasonable reward and penalty mechanisms to encourage honest participation
- **📱 Modern Interface**: Intuitive user experience based on Neumorphism design
- **🔍 Transparent & Traceable**: All operations recorded on blockchain, completely transparent

## 🖼️ Project Screenshots

### System Overview Page
![Overview Page](https://pic1.imgdb.cn/item/689db41b58cb8da5c824dee1.png)
*Displays overall system status, statistics, and quick action entries*

### Homepage Interface
![Homepage](https://pic1.imgdb.cn/item/689db3d858cb8da5c824dded.png)
*Clean and modern homepage design with clear navigation and feature entries*

### Jury Management Page
![Jury Management Page](https://pic1.imgdb.cn/item/689db45358cb8da5c824df7d.png)
*Jury registration, stake management, and related information display*

### Case Display Page
![Case Display Page](https://pic1.imgdb.cn/item/689db49658cb8da5c824e08b.png)
*Case list, status tracking, and detailed information viewing*

### Case Processing Page
![Case Processing Page](https://pic1.imgdb.cn/item/689db4e058cb8da5c824e198.png)
*Case trial, voting, and verdict execution interface*

## 🏗️ Technical Architecture

### Smart Contract Layer
- **Solidity 0.8.19**: Primary contract development language
- **OpenZeppelin**: Secure contract library
- **Hardhat**: Development, testing, and deployment framework

### Frontend Application Layer
- **Next.js 14**: React full-stack framework
- **Tailwind CSS**: Modern styling framework
- **Neumorphism Design**: Unique visual design style
- **Web3.js/Ethers.js**: Blockchain interaction library

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 16.0.0
- npm or yarn
- MetaMask wallet

### Installation Steps

1. **Clone the project**
```bash
git clone https://gitee.com/alan223/deci-court.git
cd DeciCourt
```

2. **Install smart contract dependencies**
```bash
cd deci_court
npm install
```

3. **Deploy contracts to local network**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

4. **Install frontend dependencies**
```bash
cd ../deci_court_frontend
npm install
```

5. **Start frontend application**
```bash
npm run dev
```

6. **Configure MetaMask**
   - Add local network (http://localhost:8545)
   - Import test account private key

### Detailed Configuration

Please refer to [SETUP.md](./deci_court_frontend/SETUP.md) for complete environment configuration guide.

## 📋 Functional Modules

### 🏛️ System Overview
- Real-time statistics display
- System status monitoring
- Quick action entries

### 👨‍⚖️ Jury Management
- Jury registration/deregistration
- Token staking management
- Reputation system

### 📋 Case Management
- Case creation and submission
- Case status tracking
- Evidence management

### 🗳️ Voting System
- Commit phase voting
- Reveal phase verification
- Result statistics and execution

### 📁 My Cases
- Personal case participation viewing
- Voting history records
- Earnings statistics

## 🔧 Development Guide

### Smart Contract Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Generate coverage report
npx hardhat coverage

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Development

```bash
# Development mode
npm run dev

# Build production version
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Smart Contract Testing
The project includes comprehensive unit tests and integration tests:

```bash
cd deci_court
npm test
```

Test coverage reports can be viewed in the `coverage/` directory.

### Functional Testing
- Jury registration process testing
- Case creation and voting process testing
- Reward and penalty mechanism testing
- Boundary conditions and exception handling testing

## 🌐 Deployment

### Testnet Deployment
1. Configure network parameters
2. Prepare deployment account and test tokens
3. Execute deployment scripts
4. Verify contract code

### Mainnet Deployment
- Security audit
- Multi-signature wallet configuration
- Progressive deployment strategy

## 🔧 Project Optimization Directions

### Technical Architecture Optimization
- **Smart Contract Optimization**
  - Implement more efficient jury selection algorithms to reduce randomness bias
  - Optimize voting weight calculation to support dynamic stake adjustment
  - Add case complexity assessment mechanism to automatically adjust jury numbers
  - Implement progressive unlocking mechanism to improve capital efficiency

- **Frontend Performance Enhancement**
  - Implement virtual scrolling to optimize large case displays
  - Add offline caching functionality to improve user experience
  - Integrate Web3 wallet connection optimization to support more wallet types
  - Implement real-time notification system for timely case status updates

- **Security Enhancement**
  - Implement multi-signature administrator mechanism
  - Add timelock contracts to prevent malicious operations
  - Integrate oracles to verify external evidence authenticity
  - Implement emergency pause and upgrade mechanisms

### Functional Expansion Optimization
- **Voting Mechanism Improvement**
  - Support weighted voting and expert opinions
  - Implement anonymous voting to protect privacy
  - Add voting reason recording and disclosure mechanism
  - Support phased voting and intermediate arbitration

- **Economic Model Optimization**
  - Implement dynamic fee adjustment mechanism
  - Add jury reputation system and tier system
  - Support insurance mechanism to reduce participation risk
  - Implement revenue sharing and community incentives

- **User Experience Enhancement**
  - Add case templates and smart forms
  - Implement multimedia evidence support
  - Integrate legal knowledge base and intelligent assistant
  - Support multilingual and localization

## 🌍 Application Scenarios & Domains

### Digital Asset Disputes
- **DeFi Protocol Disputes**: Handle disputes in liquidity mining and lending protocols
- **NFT Copyright Disputes**: Resolve copyright and ownership disputes of digital artworks and collectibles
- **Cryptocurrency Trading Disputes**: Handle disputes in P2P trading and OTC transactions
- **Smart Contract Execution Disputes**: Arbitrate contract execution results and parameter disputes

### Decentralized Organization Governance
- **DAO Internal Disputes**: Resolve governance disagreements within decentralized organizations
- **Community Resource Allocation**: Arbitrate disputes over community funds and resource allocation
- **Proposal Execution Disputes**: Handle disagreements in governance proposal execution
- **Member Rights Protection**: Protect legitimate rights of DAO members

### Business Cooperation Disputes
- **Cross-border E-commerce Disputes**: Handle quality and delivery disputes in international trade
- **Freelancer Disputes**: Resolve disputes in remote work and project delivery
- **Intellectual Property Disputes**: Arbitrate patent, trademark, and copyright disputes
- **Cooperation Agreement Disputes**: Handle cooperation disagreements between business partners

### Community Governance Applications
- **Online Community Management**: Handle community rule violations and user disputes
- **Content Creation Platforms**: Resolve revenue sharing disputes between creators and platforms
- **In-game Disputes**: Handle asset and rule disputes in blockchain games
- **Educational Certification Disputes**: Arbitrate disputes in online education and skill certification

### Traditional Industry Digitization
- **Supply Chain Disputes**: Handle quality and delivery disputes across supply chain links
- **Insurance Claim Disputes**: Automate dispute arbitration in insurance claims
- **Real Estate Transactions**: Handle disputes in digitized property transactions
- **Medical Data Disputes**: Resolve disputes over medical data usage and privacy protection

### Innovative Application Areas
- **Carbon Emission Trading**: Arbitrate disputes in carbon credit trading
- **Data Rights Trading**: Handle disputes over personal data usage rights
- **Virtual World Governance**: Manage virtual asset and behavior disputes in metaverse
- **AI Model Training**: Resolve disputes over AI training data usage and model rights

## 🤝 Contributing Guidelines

We welcome community contributions! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Development Standards
- Follow Solidity best practices
- Write comprehensive test cases
- Keep code comments clear
- Follow project code style

## 📄 License

This project is licensed under [CC BY-NC-SA 4.0 License](LICENSE), prohibiting commercial use.

- ✅ Allows personal use and learning
- ✅ Allows modification and distribution
- ✅ Requires attribution and same license distribution
- ❌ Prohibits commercial use

## 🙏 Acknowledgments

Thanks to all developers, testers, and community members who contributed to the project. Special thanks to:

alan223

---

**⚖️ DeciCourt - Making Justice Fairer, Making Trust Simpler**