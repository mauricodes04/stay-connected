import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Import all screens
import { HomeScreen } from './components/screens/HomeScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { GooberDetailScreen } from './components/screens/GooberDetailScreen';
import { PlanScreen } from './components/screens/PlanScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Import navigation
import { GooberTabBar, GooberTopNav } from './components/GooberNavigation';

// Import store
import { useStore } from './store/useStore';

type Screen = 'home' | 'contacts' | 'plan' | 'history' | 'settings';
type StackScreen = 'main' | 'gooberDetail';

interface NavigationState {
  activeTab: number;
  currentScreen: Screen;
  stackScreen: StackScreen;
  selectedGooberId?: string;
}

function App() {
  const { isDarkMode } = useStore();
  
  const [navigation, setNavigation] = useState<NavigationState>({
    activeTab: 0,
    currentScreen: 'home',
    stackScreen: 'main'
  });

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Screen mapping
  const screenMapping: Record<number, Screen> = {
    0: 'home',
    1: 'contacts', 
    2: 'plan',
    3: 'history',
    4: 'settings'
  };

  const handleTabChange = (tabIndex: number) => {
    setNavigation({
      activeTab: tabIndex,
      currentScreen: screenMapping[tabIndex],
      stackScreen: 'main'
    });
  };

  const handleNavigateToDetail = (gooberId: string) => {
    setNavigation(prev => ({
      ...prev,
      stackScreen: 'gooberDetail',
      selectedGooberId: gooberId
    }));
  };

  const handleNavigateBack = () => {
    setNavigation(prev => ({
      ...prev,
      stackScreen: 'main',
      selectedGooberId: undefined
    }));
  };

  const handleNavigateToContacts = () => {
    setNavigation({
      activeTab: 1,
      currentScreen: 'contacts',
      stackScreen: 'main'
    });
  };

  const handleNavigateToPlan = () => {
    setNavigation({
      activeTab: 2,
      currentScreen: 'plan',
      stackScreen: 'main'
    });
  };

  const getScreenTitle = (): string => {
    if (navigation.stackScreen === 'gooberDetail') {
      return 'Contact Details';
    }
    
    switch (navigation.currentScreen) {
      case 'home': return 'Goober';
      case 'contacts': return 'Contacts';
      case 'plan': return 'Plan 1:1';
      case 'history': return 'History';
      case 'settings': return 'Settings';
      default: return 'Goober';
    }
  };

  const renderScreen = () => {
    // Stack screen (detail view)
    if (navigation.stackScreen === 'gooberDetail' && navigation.selectedGooberId) {
      return (
        <GooberDetailScreen
          gooberId={navigation.selectedGooberId}
          onNavigateBack={handleNavigateBack}
        />
      );
    }

    // Main tab screens
    switch (navigation.currentScreen) {
      case 'home':
        return <HomeScreen onNavigateToPlan={handleNavigateToPlan} />;
      
      case 'contacts':
        return <ContactsScreen onNavigateToDetail={handleNavigateToDetail} />;
      
      case 'plan':
        return <PlanScreen onNavigateToContacts={handleNavigateToContacts} />;
      
      case 'history':
        return <HistoryScreen />;
      
      case 'settings':
        return <SettingsScreen />;
      
      default:
        return <HomeScreen onNavigateToPlan={handleNavigateToPlan} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <GooberTopNav
        title={getScreenTitle()}
        showBackButton={navigation.stackScreen === 'gooberDetail'}
        onBackPress={handleNavigateBack}
      />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto pb-24">
        <motion.div
          key={`${navigation.currentScreen}-${navigation.stackScreen}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {renderScreen()}
        </motion.div>
      </main>

      {/* Bottom Tab Navigation - Hide on detail screen */}
      {navigation.stackScreen === 'main' && (
        <GooberTabBar
          activeTab={navigation.activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}

export default App;