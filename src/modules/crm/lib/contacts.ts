import { Contact, ContactFormData, ContactFilters } from '../types/contacts';

// Mock contacts data
const mockContacts: Contact[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    company: 'ABC Construction',
    emails: [{ type: 'work', email: 'john@abcconstruction.com', primary: true }],
    phones: [{ type: 'Mobile', number: '+1-555-0123', primary: true }],
    contact_type: 'Customer',
    status: 'active',
    source: 'website',
    dnd_settings: {
      all_channels: false,
      emails: false,
      text_messages: false,
      calls_voicemails: false,
      inbound_calls_sms: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const contactsApi = {
  async getContacts(filters?: ContactFilters): Promise<Contact[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockContacts;
  },

  async createContact(data: ContactFormData): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newContact: Contact = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockContacts.push(newContact);
    return newContact;
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockContacts.findIndex(c => c.id === id);
    if (index !== -1) {
      mockContacts[index] = { ...mockContacts[index], ...data, updated_at: new Date().toISOString() };
      return mockContacts[index];
    }
    throw new Error('Contact not found');
  },

  async deleteContacts(ids: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    ids.forEach(id => {
      const index = mockContacts.findIndex(c => c.id === id);
      if (index !== -1) {
        mockContacts.splice(index, 1);
      }
    });
  },

  async exportContactsCSV(ids?: string[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const contacts = ids ? mockContacts.filter(c => ids.includes(c.id)) : mockContacts;
    const headers = 'First Name,Last Name,Company,Email,Phone\n';
    const rows = contacts.map(c => 
      `${c.first_name},${c.last_name},${c.company || ''},${c.emails[0]?.email || ''},${c.phones[0]?.number || ''}`
    ).join('\n');
    return headers + rows;
  }
};