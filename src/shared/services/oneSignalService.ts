import type { User } from "../store/services/authApi";

type OneSignalLike = {
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  User?: {
    addTags?: (tags: Record<string, string>) => Promise<void>;
    PushSubscription?: {
      optedIn?: boolean;
      optIn?: () => Promise<void>;
      optOut?: () => Promise<void>;
    };
  };
  Notifications?: {
    requestPermission?: () => Promise<void>;
  };
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalLike) => void | Promise<void>>;
  }
}

const enqueueOneSignal = (handler: (oneSignal: OneSignalLike) => void | Promise<void>) => {
  if (typeof window === "undefined") return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(handler);
};

const withOneSignal = async <T>(
  action: (oneSignal: OneSignalLike) => Promise<T> | T,
  timeoutMs = 5000
): Promise<T> => {
  if (typeof window === "undefined") {
    throw new Error("OneSignal is unavailable on server");
  }

  return await new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("OneSignal initialization timeout"));
    }, timeoutMs);

    enqueueOneSignal(async (oneSignal) => {
      try {
        const result = await action(oneSignal);
        window.clearTimeout(timer);
        resolve(result);
      } catch (error) {
        window.clearTimeout(timer);
        reject(error);
      }
    });
  });
};

export const oneSignalService = {
  syncAuthenticatedUser(user: User) {
    if (!user?.id) return;

    enqueueOneSignal(async (oneSignal) => {
      try {
        await oneSignal.login(String(user.id));

        const tags: Record<string, string> = {
          user_type: "authenticated",
        };
        if (user.companySlug) tags.company_slug = String(user.companySlug);
        if (user.organizationId) tags.organization_id = String(user.organizationId);
        if (user.organization_id) tags.organization_id = String(user.organization_id);

        if (Object.keys(tags).length > 0 && oneSignal.User?.addTags) {
          await oneSignal.User.addTags(tags);
        }

      } catch (error) {
        console.error("OneSignal auth sync failed:", error);
      }
    });
  },

  clearAuthenticatedUser() {
    enqueueOneSignal(async (oneSignal) => {
      try {
        await oneSignal.logout();
      } catch (error) {
        console.error("OneSignal logout failed:", error);
      }
    });
  },

  async getStatus(): Promise<{
    permission: NotificationPermission | "unsupported";
    optedIn: boolean;
  }> {
    const permission =
      typeof Notification === "undefined" ? "unsupported" : Notification.permission;

    if (typeof window === "undefined") return { permission, optedIn: false };

    try {
      return await withOneSignal((oneSignal) => ({
        permission,
        optedIn: !!oneSignal.User?.PushSubscription?.optedIn,
      }));
    } catch {
      return { permission, optedIn: false };
    }
  },

  async requestPermission(): Promise<void> {
    if (typeof window === "undefined") return;

    await withOneSignal(async (oneSignal) => {
      if (oneSignal.Notifications?.requestPermission) {
        await oneSignal.Notifications.requestPermission();
      }
      if (
        Notification.permission === "granted" &&
        oneSignal.User?.PushSubscription?.optIn
      ) {
        await oneSignal.User.PushSubscription.optIn();
      }
    });
  },

  async setOptIn(enabled: boolean): Promise<void> {
    if (typeof window === "undefined") return;

    await withOneSignal(async (oneSignal) => {
      const sub = oneSignal.User?.PushSubscription;
      if (!sub) return;
      if (enabled && sub.optIn) await sub.optIn();
      if (!enabled && sub.optOut) await sub.optOut();
    });
  },
};
