import React, { useState } from 'react';
import { Phone, Mail, User, Tag, Bell, BellOff, Clock, Users, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { VerificationModal } from './VerificationModal';

interface ContactDetailsProps {
  conversationId: string | null;
}

export function ContactDetails({ conversationId }: ContactDetailsProps) {
  const [followers, setFollowers] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'phone' | 'email'>('phone');

  if (!conversationId) {
    return null;
  }

  const contactData = {
    id: '123',
    phone: '+13073727509',
    email: 'john.smith@email.com',
    phoneVerified: false,
    emailVerified: true,
    owner: 'Unassigned',
    dndSettings: {
      dnd: false,
      dndAll: false,
      dndCalls: false,
      dndTexts: false,
      dndEmails: false,
      dndIncoming: false
    },
    lastInboundCall: 'Tue Oct 14 2025 03:54:02'
  };

  const handleVerify = (type: 'phone' | 'email') => {
    setVerificationType(type);
    setShowVerificationModal(true);
  };

  const handleVerified = () => {
    console.log(`${verificationType} verified successfully`);
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Contact Info */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                </div>
                {contactData.emailVerified ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVerify('email')}
                    className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-medium">Verify</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-900 dark:text-white ml-6">
                {contactData.email}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
                </div>
                {contactData.phoneVerified ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVerify('phone')}
                    className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-medium">Verify</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-900 dark:text-white ml-6">
                {contactData.phone}
              </p>
            </div>
          </div>
        </Card>

        {/* Owner */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Owner (Assigned to)</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{contactData.owner}</p>
        </Card>

        {/* Followers */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
          </div>
          <input
            type="text"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="Search followers"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </Card>

        {/* Tags */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tags</span>
          </div>
        </Card>

        {/* Active Automations */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Active Automations</h4>
        </Card>

        {/* DND Settings */}
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">DND</h4>
          
          <div className="space-y-3">
            {[
              { key: 'dnd', label: 'DND', value: contactData.dndSettings.dnd },
              { key: 'dndAll', label: 'DND All', value: contactData.dndSettings.dndAll },
              { key: 'dndCalls', label: 'DND Calls & Voicemails', value: contactData.dndSettings.dndCalls },
              { key: 'dndTexts', label: 'DND Text Messages', value: contactData.dndSettings.dndTexts },
              { key: 'dndEmails', label: 'DND Emails', value: contactData.dndSettings.dndEmails },
              { key: 'dndIncoming', label: 'DND Incoming', value: contactData.dndSettings.dndIncoming }
            ].map(({ key, label, value }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {value ? <BellOff className="w-4 h-4 text-red-500" /> : <Bell className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {value ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Last Inbound Call */}
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Inbound Call</span>
          </div>
          <p className="text-sm text-gray-900 dark:text-white">
            {contactData.lastInboundCall}
          </p>
        </Card>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        verificationType={verificationType}
        contactValue={verificationType === 'email' ? contactData.email : contactData.phone}
        contactId={contactData.id}
        onVerified={handleVerified}
      />
    </div>
  );
}