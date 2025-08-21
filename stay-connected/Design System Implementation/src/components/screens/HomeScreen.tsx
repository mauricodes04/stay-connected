import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import { Section } from '../Section';
import { PrimaryButton } from '../DesignSystemButton';
import { DefaultCard } from '../DesignSystemCard';
import { useStore } from '../../store/useStore';

interface HomeScreenProps {
  onNavigateToPlan: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToPlan }) => {
  const { events, goobers } = useStore();
  
  // Get today's date formatted
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get upcoming events (future events only)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date + 'T' + event.time);
      return eventDate > today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show only next 5 events

  const formatEventDate = (date: string, time: string) => {
    const eventDateTime = new Date(date + 'T' + time);
    const isToday = eventDateTime.toDateString() === today.toDateString();
    const isTomorrow = eventDateTime.toDateString() === new Date(today.getTime() + 86400000).toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return eventDateTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header with Today's Date */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center space-x-2 bg-soft-peach px-4 py-2 rounded-full mb-4"
          >
            <Calendar size={20} className="text-primary-text" />
            <span className="font-medium text-primary-text">Today: {todayFormatted}</span>
          </motion.div>
        </div>

        {/* Upcoming Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-primary-text mb-4">Upcoming Plans</h3>
          
          {upcomingEvents.length === 0 ? (
            <DefaultCard background="cream-beige">
              <div className="text-center py-8">
                <Calendar size={48} className="text-subtext mx-auto mb-3" />
                <p className="text-secondary-text">No upcoming plans scheduled</p>
              </div>
            </DefaultCard>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <DefaultCard background="white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-blue rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary-text">
                            Plan with {event.gooberName}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-secondary-text">
                            <span>{formatEventDate(event.date, event.time)}</span>
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatTime(event.time)}</span>
                            </div>
                            <span>{event.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DefaultCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        {(goobers.length > 0 || events.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <DefaultCard background="butter-yellow">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-text">{goobers.length}</div>
                <div className="text-sm text-secondary-text uppercase tracking-wide">Contacts</div>
              </div>
            </DefaultCard>
            <DefaultCard background="soft-peach">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-text">{events.length}</div>
                <div className="text-sm text-secondary-text uppercase tracking-wide">Total Plans</div>
              </div>
            </DefaultCard>
          </motion.div>
        )}

        {/* Full-Width Create Plan Button - Moved to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={onNavigateToPlan}
            className="w-full bg-sky-blue hover:bg-sky-blue/90 text-white rounded-full py-4 px-6 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <Plus size={24} />
              <span className="font-medium">Create a plan</span>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </Section>
  );
};