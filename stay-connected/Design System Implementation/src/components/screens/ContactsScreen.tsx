import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Search, User, Phone, Mail, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Section } from '../Section';
import { PrimaryButton, SecondaryButton } from '../DesignSystemButton';
import { DefaultCard } from '../DesignSystemCard';
import { TextInput, Checkbox } from '../DesignSystemForm';
import { useStore, mockContacts } from '../../store/useStore';

interface ContactsScreenProps {
  onNavigateToDetail: (gooberId: string) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ onNavigateToDetail }) => {
  const {
    goobers,
    addGoober,
    importedContacts,
    setImportedContacts,
    selectedContactIds,
    toggleContactSelection,
    clearContactSelection,
    contactPermissionDenied,
    setContactPermissionDenied
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [importResults, setImportResults] = useState<{ added: number; skipped: number } | null>(null);

  // Filter imported contacts by search query
  const filteredImportedContacts = importedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter saved goobers by search query
  const filteredGoobers = goobers.filter(goober =>
    goober.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (goober.nickname && goober.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (goober.email && goober.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImportContacts = async () => {
    setIsImporting(true);
    
    // Simulate permission request and contact loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Randomly simulate permission denial (20% chance)
    if (Math.random() < 0.2) {
      setContactPermissionDenied(true);
      setIsImporting(false);
      return;
    }
    
    setContactPermissionDenied(false);
    setImportedContacts(mockContacts);
    setIsImporting(false);
  };

  const handleRetryPermission = () => {
    setContactPermissionDenied(false);
    handleImportContacts();
  };

  const handleAddSelectedContacts = () => {
    let added = 0;
    let skipped = 0;

    selectedContactIds.forEach(contactId => {
      const contact = importedContacts.find(c => c.id === contactId);
      if (!contact) return;

      // Check if contact already exists
      const existingGoober = goobers.find(g => 
        g.name.toLowerCase() === contact.name.toLowerCase() ||
        (g.email && contact.email && g.email.toLowerCase() === contact.email.toLowerCase())
      );

      if (existingGoober) {
        skipped++;
      } else {
        addGoober({
          name: contact.name,
          phone: contact.phone,
          email: contact.email
        });
        added++;
      }
    });

    setImportResults({ added, skipped });
    setShowSuccessMessage(true);
    clearContactSelection();

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setImportResults(null);
    }, 3000);
  };

  return (
    <Section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Import Section */}
        <DefaultCard background="white">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-text">Import Contacts</h3>
            
            {contactPermissionDenied && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center space-x-3"
              >
                <AlertCircle size={20} className="text-error flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-error font-medium">Permission Denied</p>
                  <p className="text-xs text-error/80">We need access to your contacts to import them.</p>
                </div>
                <SecondaryButton variant="coral-pink" onClick={handleRetryPermission}>
                  Retry
                </SecondaryButton>
              </motion.div>
            )}

            {showSuccessMessage && importResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-success/10 border border-success/20 rounded-lg p-3 flex items-center space-x-3"
              >
                <CheckCircle size={20} className="text-success flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-success font-medium">Import Complete</p>
                  <p className="text-xs text-success/80">
                    {importResults.added} added, {importResults.skipped} skipped
                  </p>
                </div>
              </motion.div>
            )}
            
            <motion.button
              onClick={handleImportContacts}
              disabled={isImporting}
              className="w-full bg-sky-blue hover:bg-sky-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Download size={20} />
                <span>{isImporting ? 'Importing...' : 'Import from Device'}</span>
              </div>
            </motion.button>
          </div>
        </DefaultCard>

        {/* Search */}
        <TextInput
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {/* Imported Contacts Selection */}
        {importedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DefaultCard background="cream-beige">
              <div className="space-y-4">
                {/* Header - Single line */}
                <h3 className="text-lg font-semibold text-primary-text">Select Contacts</h3>

                {/* Contact List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredImportedContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                    >
                      <Checkbox
                        label=""
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={() => toggleContactSelection(contact.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-primary-text">{contact.name}</p>
                        <div className="text-sm text-secondary-text space-y-1">
                          {contact.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone size={12} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center space-x-1">
                              <Mail size={12} />
                              <span>{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Selected Button - Below the list, full width */}
                {selectedContactIds.length > 0 && (
                  <motion.button
                    onClick={handleAddSelectedContacts}
                    className="w-full bg-teal-green hover:bg-teal-green/90 text-white rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plus size={20} />
                      <span>Add Selected ({selectedContactIds.length})</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </DefaultCard>
          </motion.div>
        )}

        {/* Stored Goobers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-primary-text mb-4">
            Stored Goobers ({filteredGoobers.length})
          </h3>
          
          {filteredGoobers.length === 0 ? (
            <DefaultCard background="soft-peach">
              <div className="text-center py-8">
                <User size={48} className="text-subtext mx-auto mb-3" />
                <p className="text-secondary-text mb-4">
                  {searchQuery ? 'No contacts match your search' : 'No contacts saved yet'}
                </p>
                {!searchQuery && (
                  <motion.button
                    onClick={handleImportContacts}
                    className="w-full bg-sky-blue hover:bg-sky-blue/90 text-white rounded-full py-3 px-6 font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Download size={20} />
                      <span>Import Your First Contact</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </DefaultCard>
          ) : (
            <div className="space-y-2">
              {filteredGoobers.map((goober, index) => (
                <motion.div
                  key={goober.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onNavigateToDetail(goober.id)}
                  className="cursor-pointer"
                >
                  <DefaultCard background="white">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-sky-blue rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {goober.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary-text">
                          {goober.nickname ? `${goober.nickname} (${goober.name})` : goober.name}
                        </p>
                        <div className="text-sm text-secondary-text">
                          {goober.relationship && (
                            <span className="inline-block bg-teal-green/20 text-teal-green px-2 py-1 rounded-full text-xs mr-2">
                              {goober.relationship}
                            </span>
                          )}
                          {goober.phone && (
                            <span className="mr-3">{goober.phone}</span>
                          )}
                          {goober.email && (
                            <span>{goober.email}</span>
                          )}
                        </div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  </DefaultCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </Section>
  );
};