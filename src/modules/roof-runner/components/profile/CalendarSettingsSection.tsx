// import React, { useState } from 'react';
// import { Calendar, Check, Trash2, Settings, Plus, Loader2 } from 'lucide-react';

// interface CalendarConnection {
//   id: string;
//   provider: 'google';
//   email: string;
//   status: 'connected';
// }

// type TabId = 'calendars' | 'video';

// const CalendarSettingsSection: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<TabId>('calendars');
//   const [calendars, setCalendars] = useState<CalendarConnection[]>([]);

//   const [linkedCalendar] = useState<{
//     email: string;
//     calendarEmail: string;
//   } | null>(null);

//   const [conflictCalendars] = useState<string[]>([]);

//   const [hideEventDetails, setHideEventDetails] = useState(true);
//   const [timezone, setTimezone] = useState('America/New_York');
//   const [saving, setSaving] = useState(false);

//   const handleDeleteCalendar = (id: string) => {
//     if (confirm('Are you sure you want to disconnect this calendar?')) {
//       setCalendars(calendars.filter(c => c.id !== id));
//     }
//   };

//   const handleSave = () => {
//     setSaving(true);
//     // TODO: Implement save logic
//     setTimeout(() => setSaving(false), 1000);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//         <div className="border-b border-gray-200 dark:border-gray-700">
//           <div className="flex space-x-8 px-6">
//             <button
//               onClick={() => setActiveTab('calendars')}
//               className={`py-4 border-b-2 font-medium text-sm transition-colors ${
//                 activeTab === 'calendars'
//                   ? 'border-red-600 text-red-600'
//                   : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//               }`}
//             >
//               Calendars
//             </button>
//             <button
//               onClick={() => setActiveTab('video')}
//               className={`py-4 border-b-2 font-medium text-sm transition-colors ${
//                 activeTab === 'video'
//                   ? 'border-red-600 text-red-600'
//                   : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//               }`}
//             >
//               Video Conferencing
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           {activeTab === 'calendars' && (
//             <div className="space-y-6">
//               <div>
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-base font-semibold text-gray-900 dark:text-white">
//                     Connected Calendars
//                   </h3>
//                   <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
//                     <Plus className="w-4 h-4" />
//                     <span>Connect to Calendar</span>
//                   </button>
//                 </div>

//                 <div className="space-y-3">
//                   {calendars.length === 0 ? (
//                     <div className="p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
//                       No calendars connected yet.
//                     </div>
//                   ) : (
//                     calendars.map((calendar) => (
//                       <div
//                         key={calendar.id}
//                         className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-white rounded flex items-center justify-center shadow-sm">
//                             <Calendar className="w-6 h-6 text-red-600" />
//                           </div>
//                           <div>
//                             <div className="flex items-center space-x-2">
//                               <span className="text-sm font-medium text-gray-900 dark:text-white">
//                                 Google Calendar
//                               </span>
//                               <Check className="w-4 h-4 text-green-600" />
//                             </div>
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               {calendar.email}
//                             </span>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => handleDeleteCalendar(calendar.id)}
//                           className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Calendar Configuration (removed for now) */}
//             </div>
//           )}

//           {activeTab === 'video' && (
//             <div className="py-12 text-center">
//               <p className="text-gray-600 dark:text-gray-400">
//                 Video conferencing settings will be available here
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
//           Additional Calendar Settings
//         </h3>

//         <div className="space-y-6">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
//                 Private Mode for Synced Events
//               </h4>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 When turned on, only you can see your third-party calendar details, and others won't be able to.
//               </p>
//             </div>
//             <div className="ml-4">
//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={hideEventDetails}
//                   onChange={(e) => setHideEventDetails(e.target.checked)}
//                   className="sr-only peer"
//                 />
//                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
//                 <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
//                   Hide event details
//                 </span>
//               </label>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 View Appointments In
//               </label>
//               <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
//                 Timezone
//               </div>
//               <select
//                 value={timezone}
//                 onChange={(e) => setTimezone(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//               >
//                 <option value="America/New_York">GMT-05:00 America/New_York (EST)</option>
//                 <option value="America/Chicago">GMT-06:00 America/Chicago (CST)</option>
//                 <option value="America/Denver">GMT-07:00 America/Denver (MST)</option>
//                 <option value="America/Los_Angeles">GMT-08:00 America/Los_Angeles (PST)</option>
//               </select>
//               <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
//                 We'll use this timezone to display appointment times throughout the app and in your
//                 appointment-related emails — just for you. It won't affect your availability or how others book
//                 with you.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//           >
//             {saving && <Loader2 className="w-4 h-4 animate-spin" />}
//             <span>Save</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CalendarSettingsSection;

import React, { useState, useEffect } from "react";
import { Calendar, Check, Trash2, Settings, Plus, Loader2 } from "lucide-react";

interface CalendarConnection {
  id: string;
  provider: "google";
  email: string;
  status: "connected";
}

type TabId = "calendars" | "video";

const CalendarSettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("calendars");
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);

  const [linkedCalendar] = useState<{
    email: string;
    calendarEmail: string;
  } | null>(null);

  const [conflictCalendars] = useState<string[]>([]);

  const [hideEventDetails, setHideEventDetails] = useState(true);
  const [timezone, setTimezone] = useState("America/New_York");
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const token = localStorage.getItem("token");

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/profile/auth/google/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (result.success && result.data.connected) {
        setIsConnected(true);
        setUserEmail(result.data.email);
      }
    } catch (error) {
      console.error("Failed to check connection status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/profile/auth/google`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (result.success) {
        setIsConnected(false);
        setUserEmail(null);
      } else {
        alert("Failed to disconnect: " + result.message);
      }
    } catch (error) {
      console.error("Failed to disconnect:", error);
      alert("Failed to disconnect Google Calendar");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    // TODO: Implement save logic
    setTimeout(() => setSaving(false), 1000);
  };

  const handleConnectCalendar = (): void => {
    if (!window.google) {
      alert("Google SDK not loaded yet");
      return;
    }

    const client = window.google.accounts.oauth2.initCodeClient({
      // client_id: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope:
        "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
      ux_mode: "popup",

      callback: async (response: { code?: string }) => {
        if (!response.code) return;

        console.log("Received auth code:", response.code);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/profile/auth/google`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: response.code }),
          },
        );

        const result = await res.json();
        console.log("Server response:", result);

        if (!result.success) {
          throw new Error(result.message);
        }

        const { access_token, refresh_token, email, status } = result.data;

        if (access_token && refresh_token && email && status === "connected") {
          setUserEmail(email);
          setIsConnected(true);
        }
      },
    });

    client.requestCode();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("calendars")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "calendars"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Calendars
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "video"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Video Conferencing
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "calendars" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Google Calendar Integration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Connect your Google Calendar to sync events and manage
                  appointments.
                </p>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : !isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-8 h-8">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="text-base font-medium text-gray-900 dark:text-white">
                            Google Calendar
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Connect to sync your calendar events
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleConnectCalendar}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Connect to Google Calendar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {userEmail}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Connected
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={handleDisconnect}
                              disabled={disconnecting}
                              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {disconnecting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Disconnecting...
                                </>
                              ) : (
                                "Disconnect"
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Video conferencing settings will be available here
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Additional Calendar Settings
        </h3>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Private Mode for Synced Events
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When turned on, only you can see your third-party calendar
                details, and others won't be able to.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideEventDetails}
                  onChange={(e) => setHideEventDetails(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Hide event details
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Appointments In
              </label>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Timezone
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="America/New_York">
                  GMT-05:00 America/New_York (EST)
                </option>
                <option value="America/Chicago">
                  GMT-06:00 America/Chicago (CST)
                </option>
                <option value="America/Denver">
                  GMT-07:00 America/Denver (MST)
                </option>
                <option value="America/Los_Angeles">
                  GMT-08:00 America/Los_Angeles (PST)
                </option>
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                We'll use this timezone to display appointment times throughout
                the app and in your appointment-related emails — just for you.
                It won't affect your availability or how others book with you.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettingsSection;
