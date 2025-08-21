import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Calendar, Phone, Mail, Edit3, Save, Trash2, Heart } from 'lucide-react';
import { Section } from '../Section';
import { PrimaryButton, SecondaryButton } from '../DesignSystemButton';
import { DefaultCard } from '../DesignSystemCard';
import { TextInput, Dropdown } from '../DesignSystemForm';
import { useStore, Goober } from '../../store/useStore';

interface GooberDetailScreenProps {
  gooberId: string;
  onNavigateBack: () => void;
}

const relationshipOptions = [
  { value: '', label: 'Select relationship...' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'family', label: 'Family' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'client', label: 'Client' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'other', label: 'Other' }
];

export const GooberDetailScreen: React.FC<GooberDetailScreenProps> = ({ 
  gooberId, 
  onNavigateBack 
}) => {
  const { getGoober, updateGoober, deleteGoober } = useStore();
  const goober = getGoober(gooberId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form states
  const [nickname, setNickname] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (goober) {
      setNickname(goober.nickname || '');
      setRelationship(goober.relationship || '');
      setNotes(goober.notes || '');
    }
  }, [goober]);

  if (!goober) {
    return (
      <Section>
        <div className="text-center py-8">
          <p className="text-secondary-text">Contact not found</p>
          <PrimaryButton variant="sky-blue" onClick={onNavigateBack}>
            Go Back
          </PrimaryButton>
        </div>
      </Section>
    );
  }

  const handleSave = () => {
    updateGoober(gooberId, {
      nickname: nickname.trim() || undefined,
      relationship: relationship || undefined,
      notes: notes.trim() || undefined
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteGoober(gooberId);
    onNavigateBack();
  };

  const handleCancel = () => {
    setNickname(goober.nickname || '');
    setRelationship(goober.relationship || '');
    setNotes(goober.notes || '');
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRelationshipColor = (rel?: string) => {
    switch (rel) {
      case 'friend': return 'bg-teal-green/20 text-teal-green';
      case 'colleague': return 'bg-sky-blue/20 text-sky-blue';
      case 'family': return 'bg-coral-pink/20 text-coral-pink';
      case 'mentor': return 'bg-lavender-purple/20 text-lavender-purple';
      case 'client': return 'bg-butter-yellow/20 text-butter-yellow';
      default: return 'bg-cream-beige text-secondary-text';
    }
  };

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <DefaultCard background="white">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-sky-blue to-periwinkle-blue rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl text-white font-semibold">
                {goober.name.slice(0, 2).toUpperCase()}
              </span>
            </motion.div>
            
            <h2 className="text-2xl font-semibold text-primary-text mb-1">
              {goober.name}
            </h2>
            
            {goober.nickname && (
              <p className="text-secondary-text mb-2">"{goober.nickname}"</p>
            )}
            
            {goober.relationship && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRelationshipColor(goober.relationship)}`}>
                {goober.relationship.charAt(0).toUpperCase() + goober.relationship.slice(1)}
              </span>
            )}
          </div>
        </DefaultCard>

        {/* Static Information */}
        <DefaultCard background="cream-beige">
          <h3 className="text-lg font-semibold text-primary-text mb-4">Contact Information</h3>
          <div className="space-y-3">
            {goober.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-teal-green" />
                <span className="text-primary-text">{goober.phone}</span>
              </div>
            )}
            {goober.email && (
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-sky-blue" />
                <span className="text-primary-text">{goober.email}</span>
              </div>
            )}
            {goober.birthday && (
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-coral-pink" />
                <span className="text-primary-text">{formatDate(goober.birthday)}</span>
              </div>
            )}
            {!goober.phone && !goober.email && !goober.birthday && (
              <p className="text-secondary-text italic">No additional contact information</p>
            )}
          </div>
        </DefaultCard>

        {/* Editable Fields */}
        <DefaultCard background="white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">Personal Details</h3>
            {!isEditing && (
              <SecondaryButton variant="sky-blue" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} className="mr-1" />
                Edit
              </SecondaryButton>
            )}
          </div>

          <div className="space-y-4">
            <TextInput
              label="Nickname"
              placeholder="What do you call them?"
              value={nickname}
              onChange={setNickname}
              disabled={!isEditing}
            />

            <Dropdown
              label="Relationship"
              placeholder="How do you know them?"
              value={relationship}
              onChange={setRelationship}
              options={relationshipOptions}
              disabled={!isEditing}
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-primary-text tracking-wide">
                Notes
              </label>
              <textarea
                placeholder="Any notes or reminders about this person..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isEditing}
                rows={4}
                className={`
                  w-full px-4 py-3 bg-off-white border-2 border-gray-200 rounded-[12px]
                  text-base text-primary-text placeholder-subtext resize-none
                  transition-all duration-200
                  ${isEditing ? 'focus:border-sky-blue focus:shadow-[0_0_0_3px_rgba(108,166,245,0.1)]' : 'cursor-not-allowed opacity-60'}
                  disabled:cursor-not-allowed disabled:opacity-60
                `}
              />
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3 pt-2"
              >
                <PrimaryButton variant="teal-green" onClick={handleSave}>
                  <Save size={16} className="mr-1" />
                  Save
                </PrimaryButton>
                <SecondaryButton variant="coral-pink" onClick={handleCancel}>
                  Cancel
                </SecondaryButton>
              </motion.div>
            )}
          </div>
        </DefaultCard>

        {/* Actions */}
        <div className="space-y-3">
          <PrimaryButton variant="coral-pink" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} className="mr-1" />
            Delete Contact
          </PrimaryButton>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[20px] p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} className="text-error" />
                </div>
                <h3 className="text-lg font-semibold text-primary-text mb-2">Delete Contact</h3>
                <p className="text-secondary-text">
                  Are you sure you want to delete {goober.name}? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <PrimaryButton variant="coral-pink" onClick={handleDelete}>
                  Delete
                </PrimaryButton>
                <SecondaryButton variant="sky-blue" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </SecondaryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </Section>
  );
};