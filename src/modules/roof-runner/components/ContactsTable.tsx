import React from 'react';
import { MoreHorizontal, User, Briefcase, ChevronDown, Eye, Edit, FileText, Trash2, UserPlus, Handshake } from 'lucide-react';
import { hasPermission } from '../../../shared/utils/permissions';

interface Contact {
  id: string;
  createdByName: string;
  type: string;
  labelOrRole?: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  loadingContacts: boolean;
  selectedContacts: string[];
  activeDropdown: string | null;
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onDropdownToggle: (contactId: string) => void;
  onViewProfile: (contact: Contact) => void;
  onViewJob: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onContactNameClick?: (contact: Contact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  loadingContacts,
  selectedContacts,
  activeDropdown,
  onSelectContact,
  onSelectAll,
  onDropdownToggle,
  onViewProfile,
  onViewJob,
  onEdit,
  onDelete,
  onContactNameClick,
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-12 px-6 py-3">
              <input
                type="checkbox"
                checked={selectedContacts.length === contacts.length}
                onChange={onSelectAll}
                className="rounded border-gray-300 focus:ring-2"
                style={{'--tw-ring-color': '#dc2626', 'accentColor': '#dc2626'} as React.CSSProperties}
              />
            </th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                Name
                <ChevronDown className="w-3 h-3" />
              </div>
            </th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                Type
                <ChevronDown className="w-3 h-3" />
              </div>
            </th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                Label
                <ChevronDown className="w-3 h-3" />
              </div>
            </th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Phone</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Job</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Created</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {loadingContacts ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                Loading contacts...
              </td>
            </tr>
          ) : contacts.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No contacts found
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => onSelectContact(contact.id)}
                    className="rounded border-gray-300 focus:ring-2"
                    style={{'--tw-ring-color': '#dc2626', 'accentColor': '#dc2626'} as React.CSSProperties}
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => onContactNameClick ? onContactNameClick(contact) : onViewProfile(contact)}
                    className="text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 hover:underline cursor-pointer transition-colors text-left"
                  >
                    {contact.fullName}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {contact.type === 'customer' ? (
                      <User className="w-4 h-4" />
                    ) : contact.type === 'lead' ? (
                      <UserPlus className="w-4 h-4" />
                    ) : contact.type === 'partner' ? (
                      <Handshake className="w-4 h-4" />
                    ) : (
                      <Briefcase className="w-4 h-4" />
                    )}
                    <span className="capitalize">{contact.type.replace('-', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {contact.labelOrRole || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {contact.email || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {contact.phone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {contact.company || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="relative dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDropdownToggle(contact.id);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>

                    {activeDropdown === contact.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => onViewProfile(contact)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </button>
                          <button
                            onClick={() => onViewJob(contact)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <FileText className="w-4 h-4" />
                            View Job
                          </button>
                          {hasPermission('contacts', 'update') && (
                            <button
                              onClick={() => onEdit(contact)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {hasPermission('contacts', 'delete') && (
                            <button
                              onClick={() => onDelete(contact)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;