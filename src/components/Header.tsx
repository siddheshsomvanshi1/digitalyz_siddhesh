'use client'

import { FiUpload, FiCheckCircle, FiSliders, FiSettings } from 'react-icons/fi'

interface HeaderProps {
  activeTab: 'upload' | 'validate' | 'rules' | 'priority';
  setActiveTab: (tab: 'upload' | 'validate' | 'rules' | 'priority') => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: <FiUpload className="mr-2" /> },
    { id: 'validate', label: 'Validate', icon: <FiCheckCircle className="mr-2" /> },
    { id: 'rules', label: 'Create Rules', icon: <FiSettings className="mr-2" /> },
    { id: 'priority', label: 'Set Priorities', icon: <FiSliders className="mr-2" /> },
  ]

  return (
    <header className="backdrop-blur-md bg-white/70 shadow-lg rounded-2xl mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-4 gap-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 tracking-tight drop-shadow-md">Data Alchemist</h1>
        <nav className="flex flex-wrap gap-2 sm:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-5 py-2 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white/80 text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'}
              `}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header