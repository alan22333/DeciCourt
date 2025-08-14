'use client';

import { useState } from 'react';

const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  isConnected, 
  account, 
  onConnect,
  isJuror,
  tokenBalance 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const baseNavItems = [
    { id: 'overview', label: '系统概览', icon: '📊' },
    { id: 'juror', label: '陪审员管理', icon: '👨‍⚖️' },
    { id: 'case', label: '案件管理', icon: '📋' }
  ];

  const jurorOnlyItems = [
    { id: 'mycases', label: '我的案件', icon: '📁' }
  ];

  const navItems = isJuror ? [...baseNavItems, ...jurorOnlyItems] : baseNavItems;



  return (
    <nav className="neumorphism-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">⚖️</span>
              <span className="ml-2 text-xl font-bold text-gray-800">DeciCourt</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-4 py-3 text-base font-semibold transition-all duration-300 hover:bg-gray-50 rounded-lg ${
                  activeTab === item.id
                    ? 'neumorphism-nav-button active text-white'
                    : 'neumorphism-nav-button text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Wallet Button */}
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="neumorphism-button-primary text-white px-6 py-3 text-base font-bold"
              >
                连接钱包
              </button>
            ) : (
              <div className="neumorphism-card-inner min-w-0 max-w-xs">
                <div className="text-xs font-semibold text-gray-600 mb-1">钱包地址</div>
                <div className="font-mono text-sm font-bold text-gray-900 truncate" title={account}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                {tokenBalance && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">JT余额:</span>
                    <span className="text-sm font-bold text-green-600 ml-2">
                      {parseFloat(tokenBalance).toFixed(2)} JT
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="neumorphism-button p-3 text-gray-700 hover:text-gray-900"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-4 space-y-2 neumorphism-card mx-2 mb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 mb-2 text-lg font-bold transition-all duration-300 hover:bg-gray-50 rounded-lg ${
                  activeTab === item.id
                    ? 'neumorphism-nav-button active text-white'
                    : 'neumorphism-nav-button text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;