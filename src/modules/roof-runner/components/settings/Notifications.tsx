import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { oneSignalService } from "../../../../shared/services/oneSignalService";
import { notificationPreferencesApi } from "../../../../shared/services/notificationPreferencesApi";

const Notifications: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [optedIn, setOptedIn] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const refreshStatus = async () => {
    try {
      const [deviceResult, accountResult] = await Promise.allSettled([
        oneSignalService.getStatus(),
        notificationPreferencesApi.getPreferences(),
      ]);

      if (deviceResult.status === "fulfilled") {
        setPermission(deviceResult.value.permission);
        setOptedIn(deviceResult.value.optedIn);
      }

      if (accountResult.status === "fulfilled") {
        setPushEnabled(accountResult.value.pushEnabled);
      }
    } catch (error) {
      console.error("Failed to fetch notification status:", error);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await oneSignalService.requestPermission();
      await oneSignalService.setOptIn(true);
      await notificationPreferencesApi.updatePushEnabled(true);
      await refreshStatus();
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      alert("Unable to enable notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      await oneSignalService.setOptIn(false);
      await notificationPreferencesApi.updatePushEnabled(false);
      await refreshStatus();
    } catch (error) {
      console.error("Failed to pause notifications:", error);
      alert("Unable to pause notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  const permissionText =
    permission === "granted"
      ? "Allowed"
      : permission === "denied"
      ? "Blocked"
      : permission === "default"
      ? "Not decided"
      : "Unsupported";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Push Notifications
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage browser notifications for this device.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Browser permission: {permissionText}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Account preference: {pushEnabled ? "Enabled" : "Paused"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Subscription status: {optedIn ? "Enabled" : "Paused"}
            </p>
          </div>
          <button
            onClick={refreshStatus}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleEnable}
            disabled={loading || permission === "unsupported"}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
          >
            <Bell size={16} />
            Enable Notifications
          </button>
          <button
            onClick={handlePause}
            disabled={loading || (!optedIn && !pushEnabled)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60"
          >
            <BellOff size={16} />
            Pause on This Device
          </button>
        </div>

        {permission === "denied" && (
          <p className="mt-4 text-sm text-amber-600">
            Browser permission is blocked. Allow notifications in site settings,
            then click Refresh.
          </p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
