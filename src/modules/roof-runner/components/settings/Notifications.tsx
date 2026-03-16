import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BellOff, Loader, RefreshCw } from "lucide-react";
import { oneSignalService } from "../../../../shared/services/oneSignalService";
import { notificationPreferencesApi } from "../../../../shared/services/notificationPreferencesApi";

const Notifications: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [optedIn, setOptedIn] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setRefreshing(true);
    }
    setError(null);

    try {
      const [deviceResult, accountResult] = await Promise.allSettled([
        oneSignalService.getStatus(),
        notificationPreferencesApi.getPreferences(),
      ]);

      if (deviceResult.status === "fulfilled") {
        setPermission(deviceResult.value.permission);
        setOptedIn(deviceResult.value.optedIn);
      } else {
        console.error("Failed to refresh OneSignal status:", deviceResult.reason);
      }

      if (accountResult.status === "fulfilled") {
        setPushEnabled(accountResult.value.pushEnabled);
      } else {
        console.error("Failed to refresh notification preference:", accountResult.reason);
        setError("Could not refresh notification preference.");
      }
    } catch (refreshError) {
      console.error("Failed to fetch notification status:", refreshError);
      setError("Could not refresh notification status.");
    } finally {
      if (showSpinner) {
        setRefreshing(false);
      }
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshStatus(false);
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshStatus]);

  const isSupported = permission !== "unsupported";
  const isPermissionGranted = permission === "granted";
  const isPermissionBlocked = permission === "denied";
  const isFullyEnabled = isPermissionGranted && optedIn && pushEnabled;
  const isPaused = pushEnabled === false || optedIn === false;

  const permissionText =
    permission === "granted"
      ? "Allowed"
      : permission === "denied"
        ? "Blocked"
        : permission === "default"
          ? "Not decided"
          : "Unsupported";

  const overallStatus = useMemo(() => {
    if (!initialized) return "Checking";
    if (!isSupported) return "Unsupported";
    if (isPermissionBlocked) return "Blocked";
    if (isFullyEnabled) return "Enabled";
    if (isPaused) return "Paused";
    return "Needs attention";
  }, [initialized, isSupported, isPermissionBlocked, isFullyEnabled, isPaused]);

  const handleEnable = async () => {
    setLoading(true);
    setError(null);

    try {
      if (permission !== "granted") {
        await oneSignalService.requestPermission();
      }

      await oneSignalService.setOptIn(true);
      await notificationPreferencesApi.updatePushEnabled(true);
      await refreshStatus(false);
    } catch (enableError) {
      console.error("Failed to enable notifications:", enableError);
      setError("Unable to enable notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    setError(null);

    try {
      await oneSignalService.setOptIn(false);
      await notificationPreferencesApi.updatePushEnabled(false);
      await refreshStatus(false);
    } catch (pauseError) {
      console.error("Failed to pause notifications:", pauseError);
      setError("Unable to pause notifications right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Push Notifications
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage browser notifications for this device.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Overall status: {overallStatus}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browser permission: {permissionText}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Account preference: {pushEnabled ? "Enabled" : "Paused"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Device subscription: {optedIn ? "Enabled" : "Paused"}
            </p>
          </div>

          <button
            onClick={() => refreshStatus(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {!isFullyEnabled && (
            <button
              onClick={handleEnable}
              disabled={loading || refreshing || !isSupported}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? <Loader size={16} className="animate-spin" /> : <Bell size={16} />}
              {loading ? "Enabling..." : "Enable Notifications"}
            </button>
          )}

          <button
            onClick={handlePause}
            disabled={loading || refreshing || (!optedIn && !pushEnabled)}
            className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-60 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <BellOff size={16} />}
            {loading ? "Updating..." : "Pause on This Device"}
          </button>
        </div>

        {isPermissionBlocked && (
          <p className="mt-4 text-sm text-amber-600">
            Browser permission is blocked. Allow notifications in site settings, then click Refresh.
          </p>
        )}

        {!isSupported && (
          <p className="mt-4 text-sm text-amber-600">
            This browser does not support push notifications.
          </p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
