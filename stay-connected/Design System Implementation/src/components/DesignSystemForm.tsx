import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  error?: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  error?: string;
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-semibold uppercase text-primary-text tracking-wide">
          {label}
        </label>
      )}
      
      <motion.div
        className={`
          relative rounded-[12px] border-2 bg-off-white transition-all duration-200
          ${isFocused ? 'border-sky-blue shadow-[0_0_0_3px_rgba(108,166,245,0.1)]' : 'border-gray-200'}
          ${error ? 'border-error' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-transparent border-none outline-none
            text-base text-primary-text placeholder-subtext
            disabled:cursor-not-allowed
          `}
        />
      </motion.div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative">
      {label && (
        <label className="text-xs font-semibold uppercase text-primary-text tracking-wide">
          {label}
        </label>
      )}
      
      <motion.div
        className={`
          relative rounded-[12px] border-2 bg-off-white transition-all duration-200 cursor-pointer
          ${isFocused || isOpen ? 'border-sky-blue shadow-[0_0_0_3px_rgba(108,166,245,0.1)]' : 'border-gray-200'}
          ${error ? 'border-error' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        animate={(isFocused || isOpen) ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className={`text-base ${selectedOption ? 'text-primary-text' : 'text-subtext'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-subtext" />
          </motion.div>
        </div>
      </motion.div>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden"
        >
          {options.map((option) => (
            <motion.div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-4 py-3 cursor-pointer hover:bg-cream-beige transition-colors"
              whileHover={{ backgroundColor: '#F6F6F6' }}
            >
              <span className="text-base text-primary-text">{option.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <motion.label
      className={`
        flex items-center space-x-3 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      <motion.div
        className={`
          relative w-5 h-5 rounded border-2 transition-all duration-200
          ${checked ? 'bg-sky-blue border-sky-blue' : 'bg-white border-gray-300'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        animate={checked ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </motion.div>
      
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      
      <span className="text-base text-primary-text select-none">
        {label}
      </span>
    </motion.label>
  );
};

// Sample form data for demo
export const sampleDropdownOptions = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option' },
  { value: 'option4', label: 'Fourth Option' }
];