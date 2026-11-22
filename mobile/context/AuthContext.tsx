import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { AuthSession, Ofc360Role, PushNotificationItem } from '@/types/hrms';
import { hrmsService } from '@/services/hrmsService';
import { subscribeSessionExpired } from '@/services/apiClient';
import { registerForPushNotificationsAsync, triggerHaptic } from '@/services/nativeModules';

export function getRoleHomeRoute(role: Ofc360Role):
  | '/(hr-admin)/(tabs)'
  | '/(employee)/(tabs)'
  | '/(manager)/(tabs)'
  | '/(it-admin)/(tabs)'
  | '/(executive)/(tabs)' {
  switch (role) {
    case 'hr_admin':
      return '/(hr-admin)/(tabs)';
    case 'employee':
      return '/(employee)/(tabs)';
    case 'manager':
      return '/(manager)/(tabs)';
    case 'it_admin':
      return '/(it-admin)/(tabs)';
    case 'executive':
      return '/(executive)/(tabs)';
  }
}

interface AuthContextValue {
  session: AuthSession | null;
  isHydrating: boolean;
  notifications: PushNotificationItem[];
  unreadCount: number;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const loadNotifications = useCallback(async (role: Ofc360Role) => {
    try {
      const notifs = await hrmsService.fetchPushNotifications(role);
      setNotifications(notifs);
    } catch {
      // Preserve current notifications on transient network outage
    }
  }, []);

  // Hydrate encrypted session on cold launch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const restored = await hrmsService.restoreSession();
        if (!mounted) return;
        setSession(restored);
        if (restored) {
          void loadNotifications(restored.user.role);
        }
      } finally {
        if (mounted) setIsHydrating(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadNotifications]);

  // Auto-logout if token refresh fails on 401
  useEffect(() => {
    return subscribeSessionExpired(() => {
      setSession(null);
      setNotifications([]);
    });
  }, []);

  // Re-validate session & notifications when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if (prev.match(/inactive|background/) && nextState === 'active' && session) {
        void (async () => {
          try {
            const refreshedUser = await hrmsService.validateActiveSession();
            if (refreshedUser) {
              setSession((current) =>
                current ? { ...current, user: refreshedUser } : null
              );
              void loadNotifications(refreshedUser.role);
            }
          } catch {
            // 401 is handled by subscribeSessionExpired; offline stays intact
          }
        })();
      }
    });
    return () => sub.remove();
  }, [session, loadNotifications]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const next = await hrmsService.login(email, password);
      setSession(next);
      void registerForPushNotificationsAsync();
      void loadNotifications(next.user.role);
      await triggerHaptic('success');
      return next;
    },
    [loadNotifications]
  );

  const signOut = useCallback(async () => {
    await triggerHaptic('medium');
    await hrmsService.logout();
    setSession(null);
    setNotifications([]);
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await hrmsService.markNotificationsRead();
    } catch {
      // Non-fatal
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!session) return;
    await loadNotifications(session.user.role);
  }, [session, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        session,
        isHydrating,
        notifications,
        unreadCount,
        signIn,
        signOut,
        markAllNotificationsRead,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
