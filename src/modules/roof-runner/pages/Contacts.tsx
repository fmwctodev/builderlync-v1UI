import { useState } from "react";
import { Download, Plus, Filter, Mail, Tag, Trash2, Star, Share2, BookOpen, MessageCircle, Copy, ChevronDown, X } from "lucide-react";

const Contacts: React.FC = () => {
  const [selected, setSelected] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [viewMode, setViewMode] = useState<'column' | 'list'>('column');
  const [userRole, setUserRole] = useState<'Owner' | 'Admin' | 'User'>('User'); // This would come from auth context
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [editingContact, setEditingContact] = useState<any>(null);

  const handleContactClick = (contact: any) => {
    setEditingContact(contact);
    setFirstName(contact.firstName || '');
    setLastName(contact.lastName || '');
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setShowContactModal(true);
  };

  const handleExport = () => {
    if (userRole !== 'Owner') {
      alert('Only account owners can export data.');
      return;
    }
    // Export functionality here
    console.log('Exporting contacts...');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contacts</h1>
        
        {/* Top Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactModal(true)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={handleExport}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                userRole !== 'Owner' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={userRole !== 'Owner' ? 'Only owners can export data' : 'Export contacts'}
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* View Toggle + Columns + Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => setViewMode('column')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'column'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Column
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                List
              </button>
            </div>
            <button className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md text-sm flex items-center gap-1 text-gray-700 dark:text-gray-300">
              Columns
              <ChevronDown className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Quick search"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#dc2626] dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {viewMode === 'column' ? (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="w-10 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setSelected(!selected)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {["Name", "Phone", "Email", "Created", "Last Activity", "Tags"].map(
                    (header) => (
                      <th
                        key={header}
                        className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          {header}
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5 5 5M7 13l5 5 5-5"
                            />
                          </svg>
                        </div>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                <tr 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleContactClick({
                    firstName: 'Simone',
                    lastName: 'Fox',
                    email: 'test@test.com',
                    phone: '0407 884 158'
                  })}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelected(!selected);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-teal-500 text-white rounded-full font-semibold">
                      SF
                    </div>
                    <span className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">Simone Fox</span>
                  </td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400">📞 0407 884 158</td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400">✉ test@test.com</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-white">Sep 11 2024</div>
                    <div className="text-xs text-blue-500">02:51 PM (AEST)</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">—</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <div 
                className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleContactClick({
                  firstName: 'Simone',
                  lastName: 'Fox',
                  email: 'test@test.com',
                  phone: '0407 884 158'
                })}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelected(!selected);
                  }}
                  className="rounded border-gray-300 mr-4"
                />
                <div className="w-12 h-12 flex items-center justify-center bg-teal-500 text-white rounded-full font-semibold mr-4">
                  SF
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">Simone Fox</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-600 dark:text-blue-400">📞 0407 884 158</span>
                    <span className="text-blue-600 dark:text-blue-400">✉ test@test.com</span>
                    <span>Created: Sep 11 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t text-sm text-gray-600 dark:text-gray-400">
            Total 1 records. 1 of 1 Pages
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingContact ? 'Edit Contact' : 'New Contact'}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Logo */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Logo</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Personal Logo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">The proposed size is 512*512px</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">no bigger than 2.5mb</p>
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">Change</button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email 1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                  />
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">+ Add email</button>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <div className="flex gap-2 mb-2">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] dark:bg-gray-700 dark:text-white">
                      <option>Select</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">+ Add Phone Numbers</button>
                </div>

                {/* Contact Type & Time Zone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] dark:bg-gray-700 dark:text-white">
                      <option>Choose one...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] dark:bg-gray-700 dark:text-white">
                      <option>Choose one...</option>
                    </select>
                  </div>
                </div>

                {/* DND Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">DND all channels</label>
                  <div className="space-y-2">
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm">OR</div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Emails</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Text Messages</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Calls & Voicemails</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">DND Inbound Calls and SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setEditingContact(null);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                  }}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;