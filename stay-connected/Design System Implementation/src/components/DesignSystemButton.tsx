import React, { useState } from 'react';
import { motion } from 'motion/react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'coral-pink' | 'sky-blue' | 'teal-green' | 'periwinkle-blue' | 'butter-yellow' | 'lavender-purple';
  disabled?: boolean;
}

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'coral-pink' | 'sky-blue' | 'teal-green' | 'periwinkle-blue' | 'butter-yellow' | 'lavender-purple';
  disabled?: boolean;
}

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'coral-pink' | 'sky-blue' | 'teal-green' | 'periwinkle-blue' | 'butter-yellow' | 'lavender-purple';
  disabled?: boolean;
}

const variantClasses = {
  'coral-pink': {
    bg: 'bg-coral-pink hover:bg-coral-pink/90',
    border: 'border-coral-pink hover:border-coral-pink/90',
    text: 'text-coral-pink'
  },
  'sky-blue': {
    bg: 'bg-sky-blue hover:bg-sky-blue/90',
    border: 'border-sky-blue hover:border-sky-blue/90',
    text: 'text-sky-blue'
  },
  'teal-green': {
    bg: 'bg-teal-green hover:bg-teal-green/90',
    border: 'border-teal-green hover:border-teal-green/90',
    text: 'text-teal-green'
  },
  'periwinkle-blue': {
    bg: 'bg-periwinkle-blue hover:bg-periwinkle-blue/90',
    border: 'border-periwinkle-blue hover:border-periwinkle-blue/90',
    text: 'text-periwinkle-blue'
  },
  'butter-yellow': {
    bg: 'bg-butter-yellow hover:bg-butter-yellow/90',
    border: 'border-butter-yellow hover:border-butter-yellow/90',
    text: 'text-butter-yellow'
  },
  'lavender-purple': {
    bg: 'bg-lavender-purple hover:bg-lavender-purple/90',
    border: 'border-lavender-purple hover:border-lavender-purple/90',
    text: 'text-lavender-purple'
  }
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'sky-blue',
  disabled = false 
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-full text-white font-medium
        ${variantClasses[variant].bg}
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'sky-blue',
  disabled = false 
}) => {
  const [isGlowing, setIsGlowing] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onTapStart={() => setIsGlowing(true)}
      onTapCancel={() => setIsGlowing(false)}
      onTap={() => setIsGlowing(false)}
      className={`
        px-6 py-3 rounded-full font-medium border-2 bg-transparent
        ${variantClasses[variant].border} ${variantClasses[variant].text}
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isGlowing ? 'shadow-[0_0_0_2px_currentColor]' : ''}
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export const IconButton: React.FC<IconButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'sky-blue',
  disabled = false 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden w-11 h-11 rounded-full flex items-center justify-center text-white
        ${variantClasses[variant].bg}
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
      `}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 44,
            height: 44,
            animation: 'ripple 0.6s linear forwards'
          }}
        />
      ))}
    </motion.button>
  );
};