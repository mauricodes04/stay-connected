import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Calendar, Clock, Timer, Plus, Check, Share, Download, X } from 'lucide-react';
import { Section } from '../Section';
import { PrimaryButton, SecondaryButton } from '../DesignSystemButton';
import { DefaultCard } from '../DesignSystemCard';
import { useStore } from '../../store/useStore';

interface PlanScreenProps {
  onNavigateToContacts: () => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({ onNavigateToContacts }) => {
  const { goobers, addEvent } = useStore();
  
  const [selectedGooberId, setSelectedGooberId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [showGooberModal, setShowGooberModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);

  const selectedGoober = goobers.find(g => g.id === selectedGooberId);
  
  // Generate time slots (9 AM to 6 PM in 30-minute intervals)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 18 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeSlots.push({ value: time, label: displayTime });
    }
  }

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  // Get next 30 days for date selection
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const value = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
      dates.push({ value, label });
    }
    return dates;
  };

  const handleCreatePlan = () => {
    if (!selectedGoober || !selectedDate || !selectedTime) return;
    
    addEvent({
      gooberId: selectedGooberId,
      gooberName: selectedGoober.name,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration
    });

    setPlanCreated(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setPlanCreated(false);
    // Reset form
    setSelectedGooberId('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration(30);
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      time: dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const handleAddToCalendar = () => {
    // Simulate calendar permission and event creation
    alert('Calendar event created! Opening native calendar...');
  };

  const handleShareText = () => {
    if (!selectedGoober || !selectedDate || !selectedTime) return;
    
    const { date, time } = formatDateTime(selectedDate, selectedTime);
    const text = `Hey! Let's plan to meet on ${date} at ${time} for ${selectedDuration} minutes. Looking forward to our 1:1!`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Invite text copied to clipboard!');
    }
  };

  const handleShareICS = () => {
    if (!selectedGoober || !selectedDate || !selectedTime) return;
    
    const startDate = new Date(`${selectedDate}T${selectedTime}`);
    const endDate = new Date(startDate.getTime() + selectedDuration * 60000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Goober App//EN
BEGIN:VEVENT
UID:${Date.now()}@goober.app
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:1:1 with ${selectedGoober.name}
DESCRIPTION:One-on-one meeting scheduled via Goober app
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-invite.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const canCreatePlan = selectedGooberId && selectedDate && selectedTime;

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-primary-text mb-2">Plan Your 1:1</h2>
          <p className="text-secondary-text">Let's make something awesome happen! ✨</p>
        </div>

        {/* Planning Form */}
        <div className="space-y-4">
          {/* Person Selection */}
          <DefaultCard background="white">
            <button
              onClick={() => goobers.length > 0 ? setShowGooberModal(true) : onNavigateToContacts()}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-text">Person</p>
                    <p className="text-sm text-secondary-text">
                      {selectedGoober ? selectedGoober.name : 
                       goobers.length > 0 ? 'Select a contact' : 'Add contacts first'}
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          </DefaultCard>

          {/* Date Selection */}
          <DefaultCard background="white">
            <button
              onClick={() => setShowDateModal(true)}
              className="w-full text-left"
              disabled={!selectedGooberId}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedGooberId ? 'bg-teal-green' : 'bg-cream-beige'
                  }`}>
                    <Calendar size={24} className={selectedGooberId ? 'text-white' : 'text-subtext'} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedGooberId ? 'text-primary-text' : 'text-subtext'}`}>Date</p>
                    <p className="text-sm text-secondary-text">
                      {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Select a date'}
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          </DefaultCard>

          {/* Time Selection */}
          <DefaultCard background="white">
            <button
              onClick={() => setShowTimeModal(true)}
              className="w-full text-left"
              disabled={!selectedDate}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedDate ? 'bg-coral-pink' : 'bg-cream-beige'
                  }`}>
                    <Clock size={24} className={selectedDate ? 'text-white' : 'text-subtext'} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedDate ? 'text-primary-text' : 'text-subtext'}`}>Time</p>
                    <p className="text-sm text-secondary-text">
                      {selectedTime ? new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : 'Select a time'}
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          </DefaultCard>

          {/* Duration Selection */}
          <DefaultCard background="white">
            <button
              onClick={() => setShowDurationModal(true)}
              className="w-full text-left"
              disabled={!selectedTime}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedTime ? 'bg-lavender-purple' : 'bg-cream-beige'
                  }`}>
                    <Timer size={24} className={selectedTime ? 'text-white' : 'text-subtext'} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedTime ? 'text-primary-text' : 'text-subtext'}`}>Duration</p>
                    <p className="text-sm text-secondary-text">
                      {durationOptions.find(d => d.value === selectedDuration)?.label || '30 minutes'}
                    </p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          </DefaultCard>
        </div>

        {/* Create Plan Button */}
        <motion.button 
          onClick={() => setShowConfirmModal(true)}
          disabled={!canCreatePlan}
          className="w-full bg-sky-blue hover:bg-sky-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full py-4 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus size={20} />
            <span>Create Plan</span>
          </div>
        </motion.button>

        {/* No Contacts Message */}
        {goobers.length === 0 && (
          <DefaultCard background="soft-peach">
            <div className="text-center py-6">
              <p className="text-secondary-text mb-4">You need to add contacts before planning meetings</p>
              <motion.button
                onClick={onNavigateToContacts}
                className="w-full bg-teal-green hover:bg-teal-green/90 text-white rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus size={20} />
                  <span>Add Contacts</span>
                </div>
              </motion.button>
            </div>
          </DefaultCard>
        )}

        {/* Modals */}
        {/* Person Selection Modal */}
        {showGooberModal && (
          <Modal onClose={() => setShowGooberModal(false)} title="Select Person">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {goobers.map(goober => (
                <button
                  key={goober.id}
                  onClick={() => {
                    setSelectedGooberId(goober.id);
                    setShowGooberModal(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cream-beige transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-sky-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {goober.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-primary-text">{goober.name}</p>
                      {goober.relationship && (
                        <p className="text-sm text-secondary-text">{goober.relationship}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* Date Selection Modal */}
        {showDateModal && (
          <Modal onClose={() => setShowDateModal(false)} title="Select Date">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getDateOptions().map(date => (
                <button
                  key={date.value}
                  onClick={() => {
                    setSelectedDate(date.value);
                    setShowDateModal(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cream-beige transition-colors"
                >
                  <p className="font-medium text-primary-text">{date.label}</p>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* Time Selection Modal */}
        {showTimeModal && (
          <Modal onClose={() => setShowTimeModal(false)} title="Select Time">
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map(time => (
                <button
                  key={time.value}
                  onClick={() => {
                    setSelectedTime(time.value);
                    setShowTimeModal(false);
                  }}
                  className="p-3 rounded-lg hover:bg-cream-beige transition-colors text-center"
                >
                  <p className="font-medium text-primary-text">{time.label}</p>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* Duration Selection Modal */}
        {showDurationModal && (
          <Modal onClose={() => setShowDurationModal(false)} title="Select Duration">
            <div className="space-y-2">
              {durationOptions.map(duration => (
                <button
                  key={duration.value}
                  onClick={() => {
                    setSelectedDuration(duration.value);
                    setShowDurationModal(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-cream-beige transition-colors"
                >
                  <p className="font-medium text-primary-text">{duration.label}</p>
                </button>
              ))}
            </div>
          </Modal>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && selectedGoober && (
          <Modal onClose={handleCloseModal} title="Confirm Plan">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-sky-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={32} className="text-white" />
                </div>
                <h3 className="font-semibold text-primary-text mb-2">
                  Plan with {selectedGoober.name}
                </h3>
                <div className="text-sm text-secondary-text space-y-1">
                  <p>{formatDateTime(selectedDate, selectedTime).date}</p>
                  <p>{formatDateTime(selectedDate, selectedTime).time}</p>
                  <p>{durationOptions.find(d => d.value === selectedDuration)?.label}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Create Plan Button - Changes to green when created */}
                <motion.button
                  onClick={handleCreatePlan}
                  disabled={planCreated}
                  className={`w-full rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md ${
                    planCreated 
                      ? 'bg-success text-white' 
                      : 'bg-sky-blue hover:bg-sky-blue/90 text-white'
                  }`}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {planCreated ? <Check size={20} /> : <Plus size={20} />}
                    <span>{planCreated ? 'Plan Created!' : 'Create Plan'}</span>
                  </div>
                </motion.button>
                
                {/* Centered Action Buttons */}
                <div className="flex justify-center space-x-2">
                  <motion.button
                    onClick={handleAddToCalendar}
                    className="flex-1 border-2 border-teal-green text-teal-green hover:bg-teal-green hover:text-white rounded-full py-2 px-4 font-medium transition-all duration-200 ease-in-out"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar size={16} />
                      <span className="text-sm">Calendar</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleShareText}
                    className="flex-1 border-2 border-coral-pink text-coral-pink hover:bg-coral-pink hover:text-white rounded-full py-2 px-4 font-medium transition-all duration-200 ease-in-out"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Share size={16} />
                      <span className="text-sm">Text</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleShareICS}
                    className="flex-1 border-2 border-lavender-purple text-lavender-purple hover:bg-lavender-purple hover:text-white rounded-full py-2 px-4 font-medium transition-all duration-200 ease-in-out"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <Download size={16} />
                      <span className="text-sm">ICS</span>
                    </div>
                  </motion.button>
                </div>
                
                {/* Done Button */}
                <motion.button
                  onClick={handleCloseModal}
                  className="w-full bg-cream-beige hover:bg-cream-beige/80 text-primary-text rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Done
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </motion.div>
    </Section>
  );
};

// Modal Component
const Modal: React.FC<{ 
  children: React.ReactNode; 
  onClose: () => void; 
  title: string;
}> = ({ children, onClose, title }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-[20px] p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-text">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-cream-beige transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);