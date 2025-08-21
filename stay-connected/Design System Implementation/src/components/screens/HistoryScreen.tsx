import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Trash2 } from 'lucide-react';
import { Section } from '../Section';
import { DefaultCard } from '../DesignSystemCard';
import { SecondaryButton } from '../DesignSystemButton';
import { useStore } from '../../store/useStore';

export const HistoryScreen: React.FC = () => {
  const { events, deleteEvent } = useStore();

  // Sort events by date/time in reverse chronological order (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeB.getTime() - dateTimeA.getTime();
  });

  const formatEventDisplay = (event: typeof events[0]) => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    
    // Get weekday
    const weekday = eventDateTime.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Format time
    const time = eventDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Format duration
    const duration = event.duration >= 60 
      ? `${Math.floor(event.duration / 60)}h${event.duration % 60 > 0 ? ` ${event.duration % 60}m` : ''}`
      : `${event.duration}m`;
    
    // Determine if it's upcoming or past
    const isPast = eventDateTime < now;
    
    return {
      display: `${weekday} • ${time} • ${duration} — Plan with ${event.gooberName}`,
      isPast,
      fullDate: eventDateTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      deleteEvent(eventId);
    }
  };

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-primary-text mb-2">Plan History</h2>
          <p className="text-secondary-text">
            {events.length} {events.length === 1 ? 'plan' : 'plans'} total
          </p>
        </div>

        {/* Events List */}
        {sortedEvents.length === 0 ? (
          <DefaultCard background="cream-beige">
            <div className="text-center py-12">
              <Calendar size={64} className="text-subtext mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-text mb-2">No Plans Yet</h3>
              <p className="text-secondary-text mb-6">
                Your scheduled 1:1 meetings will appear here once you create them.
              </p>
            </div>
          </DefaultCard>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event, index) => {
              const eventInfo = formatEventDisplay(event);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DefaultCard background="white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Event Status Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          eventInfo.isPast 
                            ? 'bg-cream-beige' 
                            : 'bg-sky-blue'
                        }`}>
                          {eventInfo.isPast ? (
                            <Clock size={20} className="text-secondary-text" />
                          ) : (
                            <Calendar size={20} className="text-white" />
                          )}
                        </div>
                        
                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium mb-1 ${
                            eventInfo.isPast ? 'text-secondary-text' : 'text-primary-text'
                          }`}>
                            {eventInfo.display}
                          </p>
                          
                          <div className="flex items-center space-x-3 text-sm text-secondary-text">
                            <span>{eventInfo.fullDate}</span>
                            {eventInfo.isPast && (
                              <span className="bg-cream-beige text-secondary-text px-2 py-1 rounded-full text-xs">
                                Completed
                              </span>
                            )}
                            {!eventInfo.isPast && (
                              <span className="bg-sky-blue/20 text-sky-blue px-2 py-1 rounded-full text-xs">
                                Upcoming
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-subtext mt-1">
                            Created {new Date(event.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex-shrink-0 ml-4">
                        <SecondaryButton 
                          variant="coral-pink" 
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 size={16} />
                        </SecondaryButton>
                      </div>
                    </div>
                  </DefaultCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DefaultCard background="soft-peach">
              <h3 className="text-lg font-semibold text-primary-text mb-4 text-center">
                Planning Summary
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary-text">
                    {events.length}
                  </div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">
                    Total Plans
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-primary-text">
                    {events.filter(e => new Date(`${e.date}T${e.time}`) < new Date()).length}
                  </div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">
                    Completed
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-primary-text">
                    {events.filter(e => new Date(`${e.date}T${e.time}`) > new Date()).length}
                  </div>
                  <div className="text-xs text-secondary-text uppercase tracking-wide">
                    Upcoming
                  </div>
                </div>
              </div>
            </DefaultCard>
          </motion.div>
        )}
      </motion.div>
    </Section>
  );
};