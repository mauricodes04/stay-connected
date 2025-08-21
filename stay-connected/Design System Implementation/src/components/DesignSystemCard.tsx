import React from 'react';
import { motion } from 'motion/react';

interface DefaultCardProps {
  children: React.ReactNode;
  background?: 'white' | 'soft-peach' | 'cream-beige' | 'sky-blue' | 'teal-green' | 'butter-yellow';
  className?: string;
}

interface IllustrationCardProps {
  illustration: React.ReactNode;
  title: string;
  description: string;
  background?: 'white' | 'soft-peach' | 'cream-beige' | 'sky-blue' | 'teal-green' | 'butter-yellow';
  className?: string;
}

const backgroundClasses = {
  white: 'bg-white',
  'soft-peach': 'bg-soft-peach',
  'cream-beige': 'bg-cream-beige',
  'sky-blue': 'bg-sky-blue',
  'teal-green': 'bg-teal-green',
  'butter-yellow': 'bg-butter-yellow'
};

export const DefaultCard: React.FC<DefaultCardProps> = ({ 
  children, 
  background = 'white',
  className = '' 
}) => {
  return (
    <motion.div
      className={`
        ${backgroundClasses[background]} rounded-[20px] p-4
        shadow-[0_4px_10px_rgba(0,0,0,0.08)]
        transition-shadow duration-200 ease-in-out
        ${className}
      `}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export const IllustrationCard: React.FC<IllustrationCardProps> = ({ 
  illustration, 
  title, 
  description, 
  background = 'white',
  className = '' 
}) => {
  return (
    <motion.div
      className={`
        ${backgroundClasses[background]} rounded-[20px] p-4
        shadow-[0_4px_10px_rgba(0,0,0,0.08)]
        transition-shadow duration-200 ease-in-out
        cursor-pointer overflow-hidden
        ${className}
      `}
      whileHover={{ 
        scale: 1.05,
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div 
        className="mb-4 flex justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {illustration}
      </motion.div>
      
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-primary-text mb-2 leading-tight">
          {title}
        </h2>
        <p className="text-base text-primary-text leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export const FloatingIllustration: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
};