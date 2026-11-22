'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const subscribeNoop = () => () => {};

function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getIsIOSSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installedOverride, setInstalledOverride] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeNoop,
    getStandaloneSnapshot,
    () => false
  );
  const isIOS = useSyncExternalStore(
    subscribeNoop,
    getIsIOSSnapshot,
    () => false
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledOverride(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalledOverride(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled: isStandalone || installedOverride,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineSnapshot,
    () => true
  );
}

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install OFC360 mobile app"
        className={
          compact
            ? 'inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold hover:bg-[#0A66C2]/5 active:opacity-80 transition-colors cursor-pointer'
            : 'w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-md bg-[#0A66C2] text-white text-sm font-semibold hover:bg-[#004182] active:opacity-90 transition-colors cursor-pointer'
        }
      >
        <Download className="h-4 w-4 shrink-0" strokeWidth={1.85} />
        <span>Install app</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install OFC360 on iOS"
          className={
            compact
              ? 'inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md border border-[#E5E7EB] text-[#171717] text-xs font-semibold hover:bg-[#F3F2EF] active:opacity-80 transition-colors cursor-pointer'
              : 'w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-md border border-[#E5E7EB] bg-white text-[#171717] text-sm font-semibold hover:bg-[#F3F2EF] active:opacity-85 transition-colors cursor-pointer'
          }
        >
          <Download className="h-4 w-4 shrink-0 text-[#404040]" strokeWidth={1.85} />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Install on iPhone or iPad"
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 p-0 md:p-4"
          >
            <div className="w-full max-w-[440px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] p-5 pb-safe">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-[15px] font-semibold text-[#171717]">
                  Install on iPhone or iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-[13px] text-[#666666] list-decimal pl-5">
                <li>
                  Tap the <span className="font-semibold text-[#171717]">Share</span>{' '}
                  button in Safari&apos;s toolbar.
                </li>
                <li>
                  Scroll down and tap{' '}
                  <span className="font-semibold text-[#171717]">
                    Add to Home Screen
                  </span>
                  .
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full min-h-[44px] rounded-md bg-[#0A66C2] text-white text-sm font-semibold hover:bg-[#004182] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-[58px] z-30 w-full bg-[#171717] text-white px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      <span>You are offline. Reconnect to sync live workforce data.</span>
    </div>
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void;
  children: React.ReactNode;
}

/**
 * Native-feeling touch pull-to-refresh wrapper for mobile web & installed PWA mode.
 */
export function PullToRefreshContainer({
  onRefresh,
  children,
}: PullToRefreshProps) {
  const startYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const THRESHOLD = 64;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.scrollY <= 0 && !isRefreshing) {
      startYRef.current = e.touches[0]?.clientY ?? null;
    } else {
      startYRef.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startYRef.current === null || isRefreshing) return;
    const currentY = e.touches[0]?.clientY ?? startYRef.current;
    const delta = currentY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.45, 88));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(48);
      try {
        await Promise.resolve(onRefresh());
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 250);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => void handleTouchEnd()}
      className="w-full"
    >
      {(pullDistance > 8 || isRefreshing) && (
        <div
          className="flex items-center justify-center overflow-hidden bg-[#F3F2EF] transition-all duration-150"
          style={{ height: isRefreshing ? 44 : Math.round(pullDistance) }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[#666666]">
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#404040] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              strokeWidth={2}
            />
            <span>
              {isRefreshing
                ? 'Refreshing...'
                : pullDistance >= THRESHOLD
                  ? 'Release to refresh'
                  : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
