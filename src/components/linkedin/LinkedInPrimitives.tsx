'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Search,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getInitials } from '@/src/lib/linkedin-ui-helpers';

export interface LinkedInNavItem<T extends string = string> {
  id: T;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badgeCount?: number;
}

export interface LinkedInTopTabItem<T extends string = string> {
  id: T;
  label: string;
}

interface LinkedInHeaderProps<T extends string = string> {
  userName?: string;
  userRoleLabel?: string;
  unreadNotifications?: number;
  unreadMessages?: number;
  navItems?: LinkedInNavItem<T>[];
  activeNavId?: T;
  onSelectNav?: (id: T) => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  brandName?: string;
}

/**
 * LinkedIn-inspired sticky responsive header.
 * - Mobile (< 1024px): 56px pure white bar, circular avatar + OFC360 left, Search/Notifications/Messages right.
 * - Desktop (>= 1024px): 60px pure white bar with Avatar + OFC360 + Search left, 5 underlined nav items center, Notifications/Messages/Profile right.
 */
export function LinkedInHeader<T extends string = string>({
  userName,
  unreadNotifications = 0,
  unreadMessages = 0,
  navItems = [],
  activeNavId,
  onSelectNav,
  onOpenProfile,
  onOpenSearch,
  onOpenNotifications,
  onOpenMessages,
  brandName = 'OFC360',
}: LinkedInHeaderProps<T>) {
  const initials = getInitials(userName);

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E7EB]"
      style={{ height: 58 }}
    >
      <div className="mx-auto flex h-full w-full max-w-[1128px] items-center justify-between px-4">
        {/* Left: Circular Profile Avatar + Desktop Search Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="flex h-11 w-11 -ml-1.5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#0A66C2] active:opacity-75 transition-opacity cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717] text-xs font-semibold text-white">
              {initials}
            </span>
          </button>

          {/* Desktop inline search trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search workspace"
            className="hidden lg:flex ml-2 h-9 w-64 items-center gap-2 rounded-md bg-[#F3F2EF] px-3 text-left text-xs text-[#666666] hover:bg-[#E5E7EB]/70 transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
            <span className="truncate">Search people, approvals, modules</span>
          </button>
        </div>

        {/* Center: Desktop LinkedIn-style Navigation (>= 1024px) */}
        {navItems.length > 0 && onSelectNav ? (
          <nav
            aria-label="Primary desktop navigation"
            className="hidden lg:flex h-full items-stretch gap-1"
          >
            {navItems.map((item) => {
              const active = activeNavId === item.id;
              const NavIcon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-w-[78px] flex-col items-center justify-center px-3 text-[11px] transition-colors cursor-pointer ${
                    active
                      ? 'font-semibold text-[#171717]'
                      : 'font-medium text-[#666666] hover:text-[#171717]'
                  }`}
                >
                  <span className="relative flex items-center justify-center">
                    <NavIcon
                      className="h-5 w-5"
                      strokeWidth={active ? 2.15 : 1.75}
                    />
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span className="absolute -top-1.5 -right-2.5 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-[#B91C1C] px-1 text-[10px] font-semibold text-white tabular-nums">
                        {item.badgeCount > 99 ? '99+' : item.badgeCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 whitespace-nowrap">{item.label}</span>
                  {active ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        ) : null}

        {/* Right: Search (mobile), Notifications, Messaging */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="flex lg:hidden h-11 w-11 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
          >
            <Search className="h-[21px] w-[21px]" strokeWidth={1.85} />
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={
              unreadNotifications > 0
                ? `Notifications (${unreadNotifications} unread)`
                : 'Notifications'
            }
            className="relative flex h-11 w-11 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
          >
            <Bell className="h-[21px] w-[21px]" strokeWidth={1.85} />
            {unreadNotifications > 0 ? (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B91C1C] px-1 text-[10px] font-semibold text-white tabular-nums">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onOpenMessages}
            aria-label="Messaging"
            className="relative flex h-11 w-11 -mr-1.5 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
          >
            <MessageSquare className="h-[21px] w-[21px]" strokeWidth={1.85} />
            {unreadMessages > 0 ? (
              <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0A66C2] px-1 text-[10px] font-semibold text-white tabular-nums">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

interface LinkedInTopTabsProps<T extends string = string> {
  tabs: LinkedInTopTabItem<T>[];
  activeTab: T;
  onSelect: (tab: T) => void;
  ariaLabel?: string;
}

/**
 * Flat horizontal underlined tabs matching LinkedIn's mobile tab bar.
 * Equal width distribution, black active text + black underline, grey inactive text, zero pills/icons.
 */
export function LinkedInTopTabs<T extends string = string>({
  tabs,
  activeTab,
  onSelect,
  ariaLabel = 'Section tabs',
}: LinkedInTopTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex w-full bg-white border-b border-[#E5E7EB]"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onSelect(tab.id)}
            className={`relative flex-1 min-h-[44px] px-2 text-center text-[13px] whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0A66C2] ${
              active
                ? 'font-semibold text-[#171717]'
                : 'font-medium text-[#666666] hover:text-[#171717]'
            }`}
          >
            {tab.label}
            {active ? (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

interface LinkedInBottomNavProps<T extends string = string> {
  items: LinkedInNavItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
}

/**
 * Fixed 5-item LinkedIn-inspired bottom navigation bar (mobile & tablet < 1024px).
 * Pure white background, thin top border, black active icon/label + top hairline indicator,
 * grey inactive icon/label, safe-area inset aware, min 44px touch targets.
 */
export function LinkedInBottomNav<T extends string = string>({
  items,
  activeId,
  onSelect,
}: LinkedInBottomNavProps<T>) {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#E5E7EB] pb-safe"
    >
      <div className="grid grid-cols-5 h-[52px] w-full">
        {items.map((item) => {
          const active = activeId === item.id;
          const TabIcon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              title={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
              className={`relative flex min-h-[44px] items-center justify-center px-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0A66C2] ${
                active ? 'text-[#171717]' : 'text-[#666666]'
              }`}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-3 right-3 h-[2px] bg-[#171717]"
                />
              ) : null}
              <span className="relative flex items-center justify-center">
                <TabIcon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.2 : 1.75}
                />
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute -top-1 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B91C1C] px-1 text-[9px] font-semibold text-white tabular-nums">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Full-width white content section on mobile (0px radius, #F3F2EF gaps between sections)
 * and clean 8px bordered card on desktop (>= 768px).
 */
export function LinkedInSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`w-full bg-white border-y border-[#E5E7EB] md:rounded-lg md:border ${className}`}
    >
      {children}
    </section>
  );
}

export function LinkedInLoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#E5E7EB] px-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="py-3.5 space-y-2 animate-pulse">
          <div className="h-3.5 w-2/5 rounded bg-[#F3F2EF]" />
          <div className="h-3 w-3/5 rounded bg-[#F3F2EF]" />
        </div>
      ))}
    </div>
  );
}

export function LinkedInErrorState({
  message = 'Unable to load records right now.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-4 py-8 text-center"
    >
      <AlertCircle className="h-7 w-7 text-[#B91C1C]" strokeWidth={1.75} />
      <p className="mt-2.5 text-[14px] font-semibold text-[#171717]">
        Could not load data
      </p>
      <p className="mt-1 text-[13px] text-[#666666]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function LinkedInEmptyState({
  title,
  subtitle,
  variant = 'success',
}: {
  title: string;
  subtitle: string;
  variant?: 'success' | 'neutral';
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <CheckCircle2
        className={`h-7 w-7 ${
          variant === 'success' ? 'text-[#15803D]' : 'text-[#666666]'
        }`}
        strokeWidth={1.75}
      />
      <p className="mt-2.5 text-[15px] font-semibold text-[#171717]">{title}</p>
      <p className="mt-0.5 text-[13px] text-[#666666]">{subtitle}</p>
    </div>
  );
}

export interface SearchableEntry {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  onSelect: () => void;
}

export function LinkedInSearchModal({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: SearchableEntry[];
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 10);
    return entries
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.group.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [entries, query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search OFC360"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 md:pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] bg-white md:rounded-lg border-b md:border border-[#E5E7EB] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 h-14">
          <Search className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.9} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, approvals, modules..."
            className="flex-1 bg-transparent text-sm text-[#171717] placeholder:text-[#666666] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-[#E5E7EB]">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-[#171717]">No matching results</p>
              <p className="mt-1 text-xs text-[#666666]">
                Try another employee name, approval type, or module name.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onSelect();
                  setQuery('');
                  onClose();
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#F3F2EF] transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#171717]">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-[#666666] mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-[#666666] shrink-0">
                  {item.group}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export interface MessagePreviewItem {
  id: string;
  title: string;
  body: string;
  meta: string;
}

export function LinkedInMessagesModal({
  open,
  onClose,
  items,
  canCompose,
  onCompose,
}: {
  open: boolean;
  onClose: () => void;
  items: MessagePreviewItem[];
  canCompose?: boolean;
  onCompose?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Messages and Notices"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14">
          <h2 className="text-base font-semibold text-[#171717]">
            Messages & notices
          </h2>
          <div className="flex items-center gap-2">
            {canCompose && onCompose ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompose();
                }}
                className="h-8 rounded-md px-3 text-xs font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] cursor-pointer"
              >
                New notice
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close messaging"
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-[#E5E7EB]">
          {items.length === 0 ? (
            <LinkedInEmptyState
              title="No messages yet"
              subtitle="Company notices and team messages will appear here."
              variant="neutral"
            />
          ) : (
            items.map((msg) => (
              <div key={msg.id} className="px-4 py-3.5">
                <p className="text-sm font-semibold text-[#171717]">{msg.title}</p>
                <p className="mt-0.5 text-xs text-[#666666]">{msg.meta}</p>
                <p className="mt-1.5 text-[13px] text-[#404040] leading-relaxed">
                  {msg.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
