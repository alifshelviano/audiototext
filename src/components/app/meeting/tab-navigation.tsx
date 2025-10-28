'use client';

import { FileText, BarChart, Zap, Heart } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'transcript' | 'summary' | 'insights' | 'sentiment';
  onTabChange: (tab: 'transcript' | 'summary' | 'insights' | 'sentiment') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'transcript' as const, label: 'Transcript', icon: FileText },
    { id: 'summary' as const, label: 'Summary', icon: BarChart },
    { id: 'insights' as const, label: 'Insights', icon: Zap },
    { id: 'sentiment' as const, label: 'Sentiment', icon: Heart },
  ];

  return (
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center px-6 py-4 font-semibold text-sm border-b-3 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/70'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}