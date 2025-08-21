import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Palette, Info } from 'lucide-react';
import { Section } from '../Section';
import { DefaultCard } from '../DesignSystemCard';
import { useStore } from '../../store/useStore';

export const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useStore();

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-lavender-purple to-periwinkle-blue rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Palette size={32} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-primary-text mb-2">Settings</h2>
          <p className="text-secondary-text">Customize your Goober experience</p>
        </div>

        {/* Dark Mode Setting */}
        <DefaultCard background="white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-primary-text' : 'bg-cream-beige'
              }`}>
                {isDarkMode ? (
                  <Moon size={24} className="text-white" />
                ) : (
                  <Sun size={24} className="text-secondary-text" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary-text">Dark Mode</h3>
                <p className="text-sm text-secondary-text">
                  {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <motion.button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                isDarkMode ? 'bg-sky-blue' : 'bg-switch-background'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{
                  x: isDarkMode ? 28 : 4
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            </motion.button>
          </div>
        </DefaultCard>

        {/* App Information */}
        <DefaultCard background="cream-beige">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Info size={24} className="text-sky-blue" />
              <h3 className="text-lg font-semibold text-primary-text">About Goober</h3>
            </div>
            
            <div className="space-y-3 text-sm text-secondary-text">
              <p>
                <strong className="text-primary-text">Version:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-primary-text">Purpose:</strong> 
                Goober helps you manage contacts and schedule meaningful 1:1 conversations 
                with the people in your network.
              </p>
              <p>
                <strong className="text-primary-text">Features:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Import and manage contacts</li>
                <li>Schedule 1:1 meetings</li>
                <li>Export calendar events</li>
                <li>Track conversation history</li>
                <li>Dark mode support</li>
              </ul>
            </div>
          </div>
        </DefaultCard>

        {/* Theme Preview */}
        <DefaultCard background="white">
          <h3 className="text-lg font-semibold text-primary-text mb-4">Color Palette</h3>
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-sky-blue rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-secondary-text">Sky Blue</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-coral-pink rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-secondary-text">Coral Pink</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-green rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-secondary-text">Teal Green</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-butter-yellow rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-secondary-text">Butter Yellow</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-lavender-purple rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-secondary-text">Lavender</span>
            </div>
          </div>
        </DefaultCard>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <DefaultCard background="soft-peach">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-text">
                {isDarkMode ? '🌙' : '☀️'}
              </div>
              <div className="text-sm text-secondary-text uppercase tracking-wide mt-2">
                Current Theme
              </div>
            </div>
          </DefaultCard>
          
          <DefaultCard background="butter-yellow">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-text">v1.0</div>
              <div className="text-sm text-secondary-text uppercase tracking-wide mt-2">
                App Version
              </div>
            </div>
          </DefaultCard>
        </motion.div>
      </motion.div>
    </Section>
  );
};