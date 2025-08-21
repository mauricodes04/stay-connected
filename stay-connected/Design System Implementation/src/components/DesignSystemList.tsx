import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User, Mail, Phone, MapPin } from 'lucide-react';

interface ListItemProps {
  icon?: React.ReactNode;
  avatar?: string;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
  showActionButton?: boolean;
  actionButton?: React.ReactNode;
  onClick?: () => void;
  animationDelay?: number;
}

interface AnimatedListProps {
  items: Array<{
    icon?: React.ReactNode;
    avatar?: string;
    title: string;
    subtitle?: string;
    showChevron?: boolean;
    showActionButton?: boolean;
    actionButton?: React.ReactNode;
    onClick?: () => void;
  }>;
  loading?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  avatar,
  title,
  subtitle,
  showChevron = true,
  showActionButton = false,
  actionButton,
  onClick,
  animationDelay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group"
    >
      <motion.div
        onClick={onClick}
        className={`
          flex items-center px-4 py-3 bg-white hover:bg-cream-beige
          transition-colors duration-200 cursor-pointer
          ${onClick ? 'active:bg-soft-peach/30' : ''}
        `}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        {/* Left: Icon or Avatar */}
        <div className="flex-shrink-0 mr-3">
          {avatar ? (
            <div className="w-10 h-10 rounded-full bg-sky-blue flex items-center justify-center text-white font-medium">
              {avatar.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-cream-beige flex items-center justify-center text-primary-text">
              {icon || <User size={20} />}
            </div>
          )}
        </div>

        {/* Center: Text Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-primary-text truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-sm text-secondary-text truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Action or Chevron */}
        <div className="flex-shrink-0 ml-2">
          {showActionButton && actionButton ? (
            actionButton
          ) : showChevron ? (
            <motion.div
              className="text-subtext group-hover:text-secondary-text transition-colors"
              whileHover={{ x: 2 }}
            >
              <ChevronRight size={20} />
            </motion.div>
          ) : null}
        </div>
      </motion.div>
      
      {/* Divider */}
      <div className="mx-4 h-px bg-gray-200" />
    </motion.div>
  );
};

export const AnimatedList: React.FC<AnimatedListProps> = ({ items, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <motion.div
            key={index}
            className="flex items-center px-4 py-3 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1
            }}
          >
            <div className="w-10 h-10 rounded-full bg-cream-beige mr-3" />
            <div className="flex-1">
              <div className="h-4 bg-cream-beige rounded mb-1" />
              <div className="h-3 bg-cream-beige/70 rounded w-2/3" />
            </div>
            <div className="w-5 h-5 bg-cream-beige rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] overflow-hidden">
      {items.map((item, index) => (
        <ListItem
          key={index}
          {...item}
          animationDelay={index * 100}
        />
      ))}
    </div>
  );
};

// Example data for demo
export const sampleListItems = [
  {
    icon: <Mail size={20} />,
    title: "John Doe",
    subtitle: "john.doe@example.com",
    onClick: () => console.log("Clicked John Doe")
  },
  {
    avatar: "Jane Smith",
    title: "Jane Smith",
    subtitle: "Product Manager",
    onClick: () => console.log("Clicked Jane Smith")
  },
  {
    icon: <Phone size={20} />,
    title: "Contact Support",
    subtitle: "Get help with your account",
    onClick: () => console.log("Clicked Support")
  },
  {
    icon: <MapPin size={20} />,
    title: "San Francisco Office",
    subtitle: "123 Market Street",
    showChevron: false
  }
];