import React from 'react';
import { motion } from 'motion/react';
import { Home, Users, Calendar, History, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';

interface GooberTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

interface GooberTopNavProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

interface Tab {
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const GooberTabBar: React.FC<GooberTabBarProps> = ({ activeTab, onTabChange }) => {
  const { goobers } = useStore();
  const [bounceTab, setBounceTab] = React.useState<number | null>(null);

  const tabs: Tab[] = [
    { icon: <Home size={24} />, label: 'Home' },
    { 
      icon: <Users size={24} />, 
      label: 'Contacts',
      badge: goobers.length > 0 ? goobers.length : undefined
    },
    { icon: <Calendar size={24} />, label: 'Plan' },
    { icon: <History size={24} />, label: 'History' },
    { icon: <Settings size={24} />, label: 'Settings' }
  ];

  const handleTabPress = (index: number) => {
    setBounceTab(index);
    onTabChange(index);
    setTimeout(() => setBounceTab(null), 300);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.08)] z-50">
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            onClick={() => handleTabPress(index)}
            className="flex flex-col items-center py-2 px-2 min-w-[60px] relative"
            animate={bounceTab === index ? { y: [0, -4, 0] } : {}}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <motion.div
              className={`mb-1 relative ${
                activeTab === index ? 'text-sky-blue' : 'text-subtext'
              }`}
              animate={bounceTab === index ? { scale: [1, 1.1, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {tab.icon}
              {tab.badge && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-coral-pink text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {tab.badge}
                </motion.div>
              )}
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

export const GooberTopNav: React.FC<GooberTopNavProps> = ({ 
  title, 
  showBackButton = false, 
  onBackPress
}) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="w-10">
          {showBackButton && (
            <motion.button
              onClick={onBackPress}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </motion.button>
          )}
        </div>

        <h2 className="text-2xl font-semibold text-primary-text">
          {title}
        </h2>

        <div className="w-10" />
      </div>
    </div>
  );
};