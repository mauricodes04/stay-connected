import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Search, Heart, User, Settings, ArrowLeft, Filter } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

interface TopNavProps {
  title: string;
  showBackButton?: boolean;
  showActionButton?: boolean;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionIcon?: React.ReactNode;
}

interface Tab {
  icon: React.ReactNode;
  label: string;
}

const defaultTabs: Tab[] = [
  { icon: <Home size={24} />, label: 'Home' },
  { icon: <Search size={24} />, label: 'Search' },
  { icon: <Heart size={24} />, label: 'Favorites' },
  { icon: <User size={24} />, label: 'Profile' }
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const [bounceTab, setBounceTab] = useState<number | null>(null);

  const handleTabPress = (index: number) => {
    setBounceTab(index);
    onTabChange(index);
    setTimeout(() => setBounceTab(null), 300);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center">
        {defaultTabs.map((tab, index) => (
          <motion.button
            key={index}
            onClick={() => handleTabPress(index)}
            className="flex flex-col items-center py-2 px-3 min-w-[60px]"
            animate={bounceTab === index ? { y: [0, -4, 0] } : {}}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <motion.div
              className={`mb-1 ${
                activeTab === index ? 'text-sky-blue' : 'text-subtext'
              }`}
              animate={bounceTab === index ? { scale: [1, 1.1, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {tab.icon}
            </motion.div>
            <span 
              className={`text-xs font-medium uppercase tracking-wide ${
                activeTab === index ? 'text-sky-blue font-semibold' : 'text-subtext'
              }`}
            >
              {tab.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export const TopNav: React.FC<TopNavProps> = ({ 
  title, 
  showBackButton = false, 
  showActionButton = false,
  onBackPress,
  onActionPress,
  actionIcon = <Filter size={24} />
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="w-10">
          {showBackButton && (
            <motion.button
              onClick={onBackPress}
              className="p-2 rounded-full hover:bg-cream-beige transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <ArrowLeft size={20} className="text-primary-text" />
            </motion.button>
          )}
        </div>

        {/* Center */}
        <h2 className="text-2xl font-semibold text-primary-text">
          {title}
        </h2>

        {/* Right side */}
        <div className="w-10">
          {showActionButton && (
            <motion.button
              onClick={onActionPress}
              className="p-2 rounded-full hover:bg-cream-beige transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-primary-text">
                {actionIcon}
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};