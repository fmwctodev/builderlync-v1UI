import { useRef, useCallback } from 'react';
import type { ParsedHailAlert } from '../services/nwsApiService';
import { supabase } from '../../../shared/lib/supabase';

interface NotificationConfig {
  organizationId: string;
  userId: string;
  enableBrowser: boolean;
  enableEmail: boolean;
}

const DEDUP_WINDOW_MS = 30 * 60 * 1000;

export function useStormAlertNotifications(config: NotificationConfig) {
  const notifiedIdsRef = useRef<Map<string, number>>(new Map());
  const browserPermissionRef = useRef<NotificationPermission | null>(null);

  const requestBrowserPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied' as NotificationPermission;
    if (Notification.permission === 'granted') {
      browserPermissionRef.current = 'granted';
      return 'granted' as NotificationPermission;
    }
    const result = await Notification.requestPermission();
    browserPermissionRef.current = result;
    return result;
  }, []);

  const sendBrowserNotification = useCallback((alert: ParsedHailAlert) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const title = alert.event;
    const body = [
      alert.areaDesc,
      alert.maxHailInches ? `Hail up to ${alert.maxHailInches}"` : null,
      alert.severity !== 'Unknown' ? `Severity: ${alert.severity}` : null,
    ]
      .filter(Boolean)
      .join(' - ');

    new Notification(title, {
      body,
      icon: '/logo/icon.png',
      tag: `storm-alert-${alert.id}`,
      requireInteraction: alert.severity === 'Extreme' || alert.severity === 'Severe',
    });
  }, []);

  const logNotification = useCallback(
    async (alertId: string, channel: 'browser' | 'email' | 'in_app') => {
      try {
        await supabase.from('storm_alert_notifications').insert({
          organization_id: config.organizationId,
          user_id: config.userId,
          nws_alert_id: alertId,
          channel,
          alert_event: alertId,
          alert_severity: 'Unknown',
          alert_area_desc: '',
        });
      } catch {
        // non-critical
      }
    },
    [config.organizationId, config.userId]
  );

  const triggerEmailNotification = useCallback(
    async (alert: ParsedHailAlert) => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const response = await fetch(`${supabaseUrl}/functions/v1/storm-alert-email`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId: config.organizationId,
            userId: config.userId,
            alert: {
              id: alert.id,
              event: alert.event,
              severity: alert.severity,
              areaDesc: alert.areaDesc,
              headline: alert.headline,
              maxHailInches: alert.maxHailInches,
              expires: alert.expires,
            },
          }),
        });

        if (response.ok) {
          await logNotification(alert.id, 'email');
        }
      } catch {
        // non-critical
      }
    },
    [config.organizationId, config.userId, logNotification]
  );

  const processNewAlerts = useCallback(
    (alerts: ParsedHailAlert[]): ParsedHailAlert[] => {
      const now = Date.now();
      const newAlerts: ParsedHailAlert[] = [];

      for (const [id, ts] of notifiedIdsRef.current.entries()) {
        if (now - ts > DEDUP_WINDOW_MS) {
          notifiedIdsRef.current.delete(id);
        }
      }

      for (const alert of alerts) {
        if (notifiedIdsRef.current.has(alert.id)) continue;

        const stormRelated = alert.isHailRelated || alert.isThunderstormRelated || alert.isTornadoRelated;
        if (!stormRelated) continue;

        notifiedIdsRef.current.set(alert.id, now);
        newAlerts.push(alert);

        if (config.enableBrowser) {
          sendBrowserNotification(alert);
          logNotification(alert.id, 'browser');
        }

        if (config.enableEmail) {
          triggerEmailNotification(alert);
        }

        logNotification(alert.id, 'in_app');
      }

      return newAlerts;
    },
    [config.enableBrowser, config.enableEmail, sendBrowserNotification, triggerEmailNotification, logNotification]
  );

  return {
    processNewAlerts,
    requestBrowserPermission,
    sendBrowserNotification,
  };
}
