import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  BarChart3,
  Calendar,
  ListFilter,
  MapPin,
  Sparkles,
  FileDown,
  Settings,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  HolidayItem,
  HolidayCategory,
  filterHolidays,
} from '@/lib/hr-dashboard-logic';
import {
  useSaveHolidayMutation,
  useDeleteHolidayMutation,
} from '@/lib/store/hr-api';

export type HolidayModuleTab =
  | 'dashboard'
  | 'calendar'
  | 'directory'
  | 'locations'
  | 'optional'
  | 'reports'
  | 'settings';

interface HolidayCalendarScreenProps {
  holidays: HolidayItem[];
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const MODULE_TABS: {
  id: HolidayModuleTab;
  label: string;
  subtitle: string;
  badge: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard & Analytics', subtitle: 'Live KPIs, monthly & hub distribution', badge: 'KPIs', Icon: BarChart3 },
  { id: 'calendar', label: 'Interactive Calendar', subtitle: 'Month grid, year overview & agenda', badge: '2026', Icon: Calendar },
  { id: 'directory', label: 'Holiday Directory Table', subtitle: 'Search, filter & manage all holidays', badge: 'CRUD', Icon: ListFilter },
  { id: 'locations', label: 'Location Hub', subtitle: 'Regional office holiday breakdown', badge: '5 Hubs', Icon: MapPin },
  { id: 'optional', label: 'Optional Holidays', subtitle: 'Floating & restricted holiday quota', badge: 'Quota', Icon: Sparkles },
  { id: 'reports', label: 'Reports & Export', subtitle: 'CSV, PDF & iCal calendar exports', badge: 'Export', Icon: FileDown },
  { id: 'settings', label: 'Calendar Settings', subtitle: 'Governance & leave sync rules', badge: 'Admin', Icon: Settings },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORIES: (HolidayCategory | 'All')[] = [
  'All',
  'National',
  'Gazetted',
  'Regional',
  'Optional',
  'Company',
];

const LOCATIONS = ['All', 'Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'];

export function HolidayCalendarScreen({
  holidays,
  isDark,
  canManage,
  onSuccessToast,
}: HolidayCalendarScreenProps) {
  const palette = getPalette(isDark);
  const [saveHoliday, { isLoading: isSaving }] = useSaveHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const [activeTab, setActiveTab] = useState<HolidayModuleTab>('dashboard');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  // Filters for Directory & Calendar
  const [selectedCategory, setSelectedCategory] = useState<HolidayCategory | 'All'>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Calendar states
  const [calendarMode, setCalendarMode] = useState<'month' | 'year' | 'list'>('month');
  const [calendarMonthIdx, setCalendarMonthIdx] = useState<number>(0); // Jan = 0
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Optional Holidays local toggle overrides
  const [optedMap, setOptedMap] = useState<Record<string, boolean>>({});

  // Settings toggles
  const [autoLockPast, setAutoLockPast] = useState(true);
  const [syncLeaveEngine, setSyncLeaveEngine] = useState(true);
  const [weekendOverlapRule, setWeekendOverlapRule] = useState(false);

  // Add / Edit Holiday Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('2026-11-15');
  const [formCategory, setFormCategory] = useState<HolidayCategory>('National');
  const [formLocation, setFormLocation] = useState('India · All Hubs');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Details Modal
  const [detailHoliday, setDetailHoliday] = useState<HolidayItem | null>(null);

  // Dynamic Analytics Calculations (Zero Fake/Hardcoded Mock Data)
  const analytics = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const total = holidays.length;
    const upcomingList = [...holidays]
      .filter((h) => h.date >= todayIso)
      .sort((a, b) => a.date.localeCompare(b.date));
    const nationalCount = holidays.filter((h) => h.category === 'National' || h.category === 'Gazetted').length;
    const regionalCount = holidays.filter((h) => h.category === 'Regional').length;
    const optionalCount = holidays.filter((h) => h.category === 'Optional' || h.isOptional).length;

    const locationSet = new Set<string>();
    holidays.forEach((h) => {
      if (h.locations && h.locations.length > 0) {
        h.locations.forEach((l) => locationSet.add(l));
      } else if (h.location) {
        locationSet.add(h.location);
      }
    });

    const monthlyDistribution = MONTHS.map((m, idx) => {
      const count = holidays.filter((h) => h.month.toLowerCase() === m.toLowerCase()).length;
      return { month: m, short: SHORT_MONTHS[idx], count };
    });

    const maxMonthCount = Math.max(1, ...monthlyDistribution.map((m) => m.count));

    const typeBreakdown: { label: HolidayCategory; count: number; color: string }[] = [
      {
        label: 'National',
        count: holidays.filter((h) => h.category === 'National').length,
        color: palette.primary,
      },
      {
        label: 'Gazetted',
        count: holidays.filter((h) => h.category === 'Gazetted').length,
        color: palette.emerald,
      },
      {
        label: 'Regional',
        count: holidays.filter((h) => h.category === 'Regional').length,
        color: palette.amber,
      },
      {
        label: 'Optional',
        count: holidays.filter((h) => h.category === 'Optional').length,
        color: palette.violet,
      },
      {
        label: 'Company',
        count: holidays.filter((h) => h.category === 'Company').length,
        color: palette.sky,
      },
    ];

    const hubBreakdown = ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'].map((hub) => {
      const hubHolidays = holidays.filter(
        (h) =>
          h.location.toLowerCase().includes(hub.toLowerCase()) ||
          (h.locations && h.locations.some((l) => l.toLowerCase() === hub.toLowerCase()))
      );
      return {
        hub,
        count: hubHolidays.length,
        nextHoliday: hubHolidays[0]?.name || 'No scheduled holiday',
      };
    });

    return {
      total,
      upcomingCount: upcomingList.length,
      upcomingList,
      nationalCount,
      regionalCount,
      optionalCount,
      locationCount: locationSet.size,
      monthlyDistribution,
      maxMonthCount,
      typeBreakdown,
      hubBreakdown,
    };
  }, [holidays, palette.amber, palette.emerald, palette.primary, palette.sky, palette.violet]);

  const filteredHolidays = useMemo(() => {
    return filterHolidays(
      holidays,
      selectedCategory,
      selectedMonth,
      selectedLocation,
      'All',
      searchQuery
    );
  }, [holidays, selectedCategory, selectedMonth, selectedLocation, searchQuery]);

  const openAddModal = () => {
    setEditingHoliday(null);
    setFormName('');
    setFormDate('2026-11-15');
    setFormCategory('National');
    setFormLocation('India · All Hubs');
    setFormDescription('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: HolidayItem) => {
    setEditingHoliday(item);
    setFormName(item.name);
    setFormDate(item.date);
    setFormCategory(item.category);
    setFormLocation(item.location);
    setFormDescription(item.description);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveHoliday = async () => {
    if (formName.trim().length < 3) {
      setFormError('Holiday name must be at least 3 characters.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formDate.trim())) {
      setFormError('Date must be in YYYY-MM-DD format (e.g., 2026-11-15).');
      return;
    }

    const parsedDate = new Date(`${formDate.trim()}T00:00:00`);
    const monthName = MONTHS[parsedDate.getMonth()] || 'January';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[parsedDate.getDay()] || 'Monday';
    const shortM = SHORT_MONTHS[parsedDate.getMonth()] || 'Jan';
    const dayNum = formDate.trim().slice(8, 10);

    try {
      await saveHoliday({
        id: editingHoliday?.id,
        name: formName.trim(),
        date: formDate.trim(),
        displayDate: `${shortM} ${dayNum}, ${formDate.trim().slice(0, 4)}`,
        month: monthName,
        dayOfWeek,
        category: formCategory,
        location: formLocation.trim() || 'Global · All Hubs',
        description: formDescription.trim() || 'Statutory enterprise holiday.',
        status: 'Published',
      }).unwrap();

      onSuccessToast(
        editingHoliday ? `Updated ${formName.trim()}` : `Added ${formName.trim()} to 2026 Calendar`
      );
      setIsFormOpen(false);
    } catch {
      setFormError('Could not save holiday. Please try again.');
    }
  };

  const handleDeleteHoliday = async (item: HolidayItem) => {
    try {
      await deleteHoliday({ id: item.id }).unwrap();
      onSuccessToast(`Removed ${item.name}`);
      if (detailHoliday?.id === item.id) {
        setDetailHoliday(null);
      }
    } catch {
      onSuccessToast('Unable to delete holiday');
    }
  };

  const getCategoryColors = (cat: HolidayCategory) => {
    switch (cat) {
      case 'National':
        return { bg: palette.primaryLight, text: palette.primary };
      case 'Gazetted':
        return { bg: palette.emeraldBg, text: palette.emerald };
      case 'Regional':
        return { bg: palette.amberBg, text: palette.amber };
      case 'Optional':
      case 'Restricted':
        return { bg: palette.violetBg, text: palette.violet };
      default:
        return { bg: palette.skyBg, text: palette.sky };
    }
  };

  const activeTabMeta = MODULE_TABS.find((t) => t.id === activeTab) || MODULE_TABS[0];

  // Build 2026 Calendar Grid for calendarMonthIdx
  const monthCalendarDays = useMemo(() => {
    const year = 2026;
    const firstDay = new Date(year, calendarMonthIdx, 1).getDay();
    const daysInMonth = new Date(year, calendarMonthIdx + 1, 0).getDate();
    const cells: { day: number | null; dateStr: string | null; holidays: HolidayItem[] }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null, holidays: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(calendarMonthIdx + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      const dayHols = holidays.filter((h) => h.date === dateStr);
      cells.push({ day: d, dateStr, holidays: dayHols });
    }
    return cells;
  }, [calendarMonthIdx, holidays]);

  return (
    <View style={styles.container}>
      {/* Top Action Bar with Active View Name, + Add Holiday, and 3-Dot View Switcher */}
      <View
        style={[
          styles.topCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.topHeaderRow}>
          <View style={styles.topTitleWrap}>
            <Text style={[styles.activeViewLabel, { color: palette.primary }]}>
              HOLIDAY GOVERNANCE · 2026
            </Text>
            <Text style={[styles.activeViewTitle, { color: palette.textPrimary }]}>
              {activeTabMeta.label}
            </Text>
            <Text style={[styles.activeViewSub, { color: palette.textMuted }]}>
              {activeTabMeta.subtitle}
            </Text>
          </View>

          <View style={styles.topActions}>
            {canManage ? (
              <Pressable
                onPress={openAddModal}
                style={[styles.addBtn, { backgroundColor: palette.primary }]}
              >
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            ) : null}

            {/* 3-Dot View Selector Button */}
            <Pressable
              accessibilityLabel="Switch Holiday Calendar View"
              onPress={() => setIsViewMenuOpen(true)}
              style={[
                styles.threeDotBtn,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                },
              ]}
            >
              <MoreVertical size={18} color={palette.textPrimary} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* 1. DASHBOARD & ANALYTICS VIEW */}
      {activeTab === 'dashboard' ? (
        <View style={styles.sectionStack}>
          {/* 6 Clickable KPI Cards */}
          <View style={styles.kpiGrid}>
            <Pressable
              onPress={() => {
                setSelectedCategory('All');
                setActiveTab('directory');
              }}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>TOTAL HOLIDAYS</Text>
              <Text style={[styles.kpiValue, { color: palette.textPrimary }]}>
                {analytics.total}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.primary }]}>
                Tap to view directory →
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedCategory('All');
                setActiveTab('calendar');
              }}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>UPCOMING</Text>
              <Text style={[styles.kpiValue, { color: palette.emerald }]}>
                {analytics.upcomingCount}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.emerald }]}>
                Remaining in 2026 →
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedCategory('National');
                setActiveTab('directory');
              }}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>NATIONAL & GAZETTED</Text>
              <Text style={[styles.kpiValue, { color: palette.primary }]}>
                {analytics.nationalCount}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.textSecondary }]}>
                Mandatory paid days
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSelectedCategory('Regional');
                setActiveTab('directory');
              }}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>REGIONAL</Text>
              <Text style={[styles.kpiValue, { color: palette.amber }]}>
                {analytics.regionalCount}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.textSecondary }]}>
                State & hub specific
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('optional')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>OPTIONAL / FLOATING</Text>
              <Text style={[styles.kpiValue, { color: palette.violet }]}>
                {analytics.optionalCount}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.violet }]}>
                Manage quota →
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('locations')}
              style={[
                styles.kpiCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.kpiLabel, { color: palette.textMuted }]}>OFFICE LOCATIONS</Text>
              <Text style={[styles.kpiValue, { color: palette.sky }]}>
                {analytics.locationCount}
              </Text>
              <Text style={[styles.kpiHint, { color: palette.sky }]}>
                View regional hubs →
              </Text>
            </Pressable>
          </View>

          {/* Monthly Holiday Distribution Bar Chart */}
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Monthly Holiday Distribution
            </Text>
            <Text style={[styles.cardSub, { color: palette.textMuted }]}>
              Tap any month bar to filter directory
            </Text>

            <View style={styles.barChartRow}>
              {analytics.monthlyDistribution.map((item) => {
                const heightPct = Math.max(12, Math.round((item.count / analytics.maxMonthCount) * 88));
                return (
                  <Pressable
                    key={item.month}
                    onPress={() => {
                      setSelectedMonth(item.month);
                      setActiveTab('directory');
                    }}
                    style={styles.barCol}
                  >
                    <Text style={[styles.barValue, { color: palette.textSecondary }]}>
                      {item.count}
                    </Text>
                    <View
                      style={[
                        styles.barTrack,
                        { backgroundColor: palette.surfaceMuted },
                      ]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor: item.count > 0 ? palette.primary : palette.border,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: palette.textMuted }]}>
                      {item.short}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Holiday Type Breakdown & Location Distribution */}
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Holiday Type Distribution
            </Text>
            <View style={styles.typeList}>
              {analytics.typeBreakdown.map((t) => {
                const pct =
                  analytics.total > 0 ? Math.round((t.count / analytics.total) * 100) : 0;
                return (
                  <Pressable
                    key={t.label}
                    onPress={() => {
                      setSelectedCategory(t.label);
                      setActiveTab('directory');
                    }}
                    style={styles.typeItem}
                  >
                    <View style={styles.typeHeader}>
                      <View style={styles.typeLabelRow}>
                        <View style={[styles.dot, { backgroundColor: t.color }]} />
                        <Text style={[styles.typeName, { color: palette.textPrimary }]}>
                          {t.label}
                        </Text>
                      </View>
                      <Text style={[styles.typeCount, { color: palette.textSecondary }]}>
                        {t.count} ({pct}%)
                      </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${Math.max(4, pct)}%`, backgroundColor: t.color },
                        ]}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Upcoming Holidays Timeline */}
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
                  Upcoming Holidays Timeline
                </Text>
                <Text style={[styles.cardSub, { color: palette.textMuted }]}>
                  Next scheduled statutory & optional observances
                </Text>
              </View>
              <Pressable onPress={() => setActiveTab('directory')}>
                <Text style={[styles.linkText, { color: palette.primary }]}>View All</Text>
              </Pressable>
            </View>

            {analytics.upcomingList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                  No upcoming holidays remaining
                </Text>
              </View>
            ) : (
              analytics.upcomingList.slice(0, 5).map((h) => {
                const badgeTone = getCategoryColors(h.category);
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => setDetailHoliday(h)}
                    style={[
                      styles.timelineRow,
                      { borderBottomColor: palette.borderSubtle },
                    ]}
                  >
                    <View
                      style={[
                        styles.dateBadge,
                        { backgroundColor: palette.primaryLight },
                      ]}
                    >
                      <Text style={[styles.dateBadgeMonth, { color: palette.primary }]}>
                        {h.displayDate.slice(0, 3).toUpperCase()}
                      </Text>
                      <Text style={[styles.dateBadgeDay, { color: palette.textPrimary }]}>
                        {h.date.slice(8, 10)}
                      </Text>
                    </View>
                    <View style={styles.timelineInfo}>
                      <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                        {h.name}
                      </Text>
                      <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                        {h.dayOfWeek} · {h.location}
                      </Text>
                    </View>
                    <View style={[styles.catBadge, { backgroundColor: badgeTone.bg }]}>
                      <Text style={[styles.catBadgeText, { color: badgeTone.text }]}>
                        {h.category}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      ) : null}

      {/* 2. INTERACTIVE CALENDAR VIEW */}
      {activeTab === 'calendar' ? (
        <View style={styles.sectionStack}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            {/* Mode Switcher: Month / Year / List */}
            <View style={[styles.segmentedRow, { backgroundColor: palette.surfaceMuted }]}>
              {(['month', 'year', 'list'] as const).map((m) => {
                const active = calendarMode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setCalendarMode(m)}
                    style={[
                      styles.segmentBtn,
                      active ? { backgroundColor: palette.primary } : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: active ? '#FFFFFF' : palette.textSecondary },
                      ]}
                    >
                      {m === 'month' ? 'Month Grid' : m === 'year' ? 'Year 2026' : 'Agenda List'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {calendarMode === 'month' ? (
              <View>
                <View style={styles.monthNavRow}>
                  <Pressable
                    onPress={() =>
                      setCalendarMonthIdx((prev) => (prev === 0 ? 11 : prev - 1))
                    }
                    style={[styles.navArrowBtn, { backgroundColor: palette.surfaceMuted }]}
                  >
                    <ChevronLeft size={18} color={palette.textPrimary} strokeWidth={2.2} />
                  </Pressable>
                  <Text style={[styles.monthTitle, { color: palette.textPrimary }]}>
                    {MONTHS[calendarMonthIdx]} 2026
                  </Text>
                  <Pressable
                    onPress={() =>
                      setCalendarMonthIdx((prev) => (prev === 11 ? 0 : prev + 1))
                    }
                    style={[styles.navArrowBtn, { backgroundColor: palette.surfaceMuted }]}
                  >
                    <ChevronRight size={18} color={palette.textPrimary} strokeWidth={2.2} />
                  </Pressable>
                </View>

                <View style={styles.weekHeaderRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <Text
                      key={d}
                      style={[styles.weekHeaderDay, { color: palette.textMuted }]}
                    >
                      {d}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {monthCalendarDays.map((cell, idx) => {
                    const hasHoliday = cell.holidays.length > 0;
                    const isSelected = cell.dateStr && selectedDateStr === cell.dateStr;
                    return (
                      <Pressable
                        key={idx}
                        disabled={!cell.day}
                        onPress={() => {
                          if (cell.dateStr) {
                            setSelectedDateStr(cell.dateStr);
                          }
                        }}
                        style={[
                          styles.calendarCell,
                          {
                            borderColor: isSelected
                              ? palette.primary
                              : hasHoliday
                              ? palette.emerald
                              : palette.borderSubtle,
                            backgroundColor: isSelected
                              ? palette.primaryLight
                              : hasHoliday
                              ? palette.emeraldBg
                              : 'transparent',
                          },
                        ]}
                      >
                        {cell.day ? (
                          <>
                            <Text
                              style={[
                                styles.calendarDayNum,
                                {
                                  color: hasHoliday
                                    ? palette.emerald
                                    : palette.textPrimary,
                                  fontWeight: hasHoliday ? '700' : '500',
                                },
                              ]}
                            >
                              {cell.day}
                            </Text>
                            {hasHoliday ? (
                              <View
                                style={[
                                  styles.holidayDot,
                                  { backgroundColor: palette.emerald },
                                ]}
                              />
                            ) : null}
                          </>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Holidays in Current Month */}
                <View style={styles.monthHolidaysSection}>
                  <Text style={[styles.subHeading, { color: palette.textSecondary }]}>
                    HOLIDAYS IN {MONTHS[calendarMonthIdx].toUpperCase()} 2026
                  </Text>
                  {holidays.filter(
                    (h) => h.month.toLowerCase() === MONTHS[calendarMonthIdx].toLowerCase()
                  ).length === 0 ? (
                    <Text style={[styles.emptyHint, { color: palette.textMuted }]}>
                      No statutory holidays scheduled in {MONTHS[calendarMonthIdx]}.
                    </Text>
                  ) : (
                    holidays
                      .filter(
                        (h) =>
                          h.month.toLowerCase() === MONTHS[calendarMonthIdx].toLowerCase()
                      )
                      .map((h) => {
                        const tone = getCategoryColors(h.category);
                        return (
                          <Pressable
                            key={h.id}
                            onPress={() => setDetailHoliday(h)}
                            style={[
                              styles.timelineRow,
                              { borderBottomColor: palette.borderSubtle },
                            ]}
                          >
                            <View
                              style={[
                                styles.dateBadge,
                                { backgroundColor: tone.bg },
                              ]}
                            >
                              <Text style={[styles.dateBadgeMonth, { color: tone.text }]}>
                                {h.displayDate.slice(0, 3).toUpperCase()}
                              </Text>
                              <Text style={[styles.dateBadgeDay, { color: palette.textPrimary }]}>
                                {h.date.slice(8, 10)}
                              </Text>
                            </View>
                            <View style={styles.timelineInfo}>
                              <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                                {h.name}
                              </Text>
                              <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                                {h.dayOfWeek} · {h.location}
                              </Text>
                            </View>
                            <View style={[styles.catBadge, { backgroundColor: tone.bg }]}>
                              <Text style={[styles.catBadgeText, { color: tone.text }]}>
                                {h.category}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })
                  )}
                </View>
              </View>
            ) : null}

            {calendarMode === 'year' ? (
              <View style={styles.yearGrid}>
                {MONTHS.map((m, idx) => {
                  const mHols = holidays.filter(
                    (h) => h.month.toLowerCase() === m.toLowerCase()
                  );
                  return (
                    <Pressable
                      key={m}
                      onPress={() => {
                        setCalendarMonthIdx(idx);
                        setCalendarMode('month');
                      }}
                      style={[
                        styles.yearMonthCard,
                        {
                          backgroundColor: palette.surfaceMuted,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Text style={[styles.yearMonthTitle, { color: palette.textPrimary }]}>
                        {m}
                      </Text>
                      <Text style={[styles.yearMonthCount, { color: palette.primary }]}>
                        {mHols.length} {mHols.length === 1 ? 'Holiday' : 'Holidays'}
                      </Text>
                      {mHols.slice(0, 2).map((h) => (
                        <Text
                          key={h.id}
                          numberOfLines={1}
                          style={[styles.yearMonthItem, { color: palette.textSecondary }]}
                        >
                          • {h.date.slice(8, 10)} {h.name}
                        </Text>
                      ))}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {calendarMode === 'list' ? (
              <View>
                {holidays.map((h) => {
                  const tone = getCategoryColors(h.category);
                  return (
                    <Pressable
                      key={h.id}
                      onPress={() => setDetailHoliday(h)}
                      style={[
                        styles.timelineRow,
                        { borderBottomColor: palette.borderSubtle },
                      ]}
                    >
                      <View style={[styles.dateBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.dateBadgeMonth, { color: tone.text }]}>
                          {h.displayDate.slice(0, 3).toUpperCase()}
                        </Text>
                        <Text style={[styles.dateBadgeDay, { color: palette.textPrimary }]}>
                          {h.date.slice(8, 10)}
                        </Text>
                      </View>
                      <View style={styles.timelineInfo}>
                        <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                          {h.name}
                        </Text>
                        <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                          {h.dayOfWeek} · {h.location}
                        </Text>
                      </View>
                      <View style={[styles.catBadge, { backgroundColor: tone.bg }]}>
                        <Text style={[styles.catBadgeText, { color: tone.text }]}>
                          {h.category}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* 3. HOLIDAY DIRECTORY TABLE VIEW */}
      {activeTab === 'directory' ? (
        <View style={styles.sectionStack}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search holiday by name, hub, or category..."
              placeholderTextColor={palette.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <View style={styles.filterRow}>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? palette.primary : palette.surfaceMuted,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? '#FFFFFF' : palette.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              <View style={styles.filterRow}>
                {LOCATIONS.map((loc) => {
                  const active = selectedLocation === loc;
                  return (
                    <Pressable
                      key={loc}
                      onPress={() => setSelectedLocation(loc)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? palette.emerald : palette.surfaceMuted,
                          borderColor: active ? palette.emerald : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? '#FFFFFF' : palette.textSecondary },
                        ]}
                      >
                        {loc === 'All' ? 'All Locations' : loc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {selectedMonth !== 'All' ? (
              <Pressable
                onPress={() => setSelectedMonth('All')}
                style={[styles.clearFilterBanner, { backgroundColor: palette.primaryLight }]}
              >
                <Text style={[styles.clearFilterText, { color: palette.primary }]}>
                  Filtered by Month: {selectedMonth} (Tap to Clear)
                </Text>
              </Pressable>
            ) : null}

            <Text style={[styles.resultCount, { color: palette.textMuted }]}>
              Showing {filteredHolidays.length} of {holidays.length} holidays
            </Text>

            {filteredHolidays.map((h) => {
              const tone = getCategoryColors(h.category);
              return (
                <View
                  key={h.id}
                  style={[
                    styles.directoryCard,
                    {
                      backgroundColor: palette.surfaceMuted,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.directoryTop}>
                    <View style={[styles.dateBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.dateBadgeMonth, { color: tone.text }]}>
                        {h.displayDate.slice(0, 3).toUpperCase()}
                      </Text>
                      <Text style={[styles.dateBadgeDay, { color: palette.textPrimary }]}>
                        {h.date.slice(8, 10)}
                      </Text>
                    </View>
                    <View style={styles.directoryMain}>
                      <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                        {h.name}
                      </Text>
                      <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                        {h.displayDate} ({h.dayOfWeek}) · {h.location}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[styles.directoryDesc, { color: palette.textSecondary }]}
                      >
                        {h.description}
                      </Text>
                    </View>
                    <View style={[styles.catBadge, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.catBadgeText, { color: tone.text }]}>
                        {h.category}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.directoryActions, { borderTopColor: palette.border }]}>
                    <Pressable
                      onPress={() => setDetailHoliday(h)}
                      style={[styles.dirActionBtn, { backgroundColor: palette.surface }]}
                    >
                      <Eye size={13} color={palette.textSecondary} />
                      <Text style={[styles.dirActionText, { color: palette.textSecondary }]}>
                        Details
                      </Text>
                    </Pressable>
                    {canManage ? (
                      <>
                        <Pressable
                          onPress={() => openEditModal(h)}
                          style={[styles.dirActionBtn, { backgroundColor: palette.primaryLight }]}
                        >
                          <Pencil size={13} color={palette.primary} />
                          <Text style={[styles.dirActionText, { color: palette.primary }]}>
                            Edit
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteHoliday(h)}
                          style={[styles.dirActionBtn, { backgroundColor: palette.roseBg }]}
                        >
                          <Trash2 size={13} color={palette.rose} />
                          <Text style={[styles.dirActionText, { color: palette.rose }]}>
                            Delete
                          </Text>
                        </Pressable>
                      </>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 4. LOCATION HUB VIEW */}
      {activeTab === 'locations' ? (
        <View style={styles.sectionStack}>
          {analytics.hubBreakdown.map((hubItem) => (
            <View
              key={hubItem.hub}
              style={[
                styles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
                    {hubItem.hub} Office Hub
                  </Text>
                  <Text style={[styles.cardSub, { color: palette.textMuted }]}>
                    Next: {hubItem.nextHoliday}
                  </Text>
                </View>
                <View style={[styles.catBadge, { backgroundColor: palette.primaryLight }]}>
                  <Text style={[styles.catBadgeText, { color: palette.primary }]}>
                    {hubItem.count} Holidays
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  setSelectedLocation(hubItem.hub);
                  setActiveTab('directory');
                }}
                style={[
                  styles.hubBtn,
                  { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.hubBtnText, { color: palette.primary }]}>
                  Filter {hubItem.hub} Holiday Schedule →
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {/* 5. OPTIONAL HOLIDAYS VIEW */}
      {activeTab === 'optional' ? (
        <View style={styles.sectionStack}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Floating & Restricted Holiday Quota
            </Text>
            <Text style={[styles.cardSub, { color: palette.textMuted }]}>
              Employees can claim up to 2 optional holidays per calendar year
            </Text>

            {holidays
              .filter((h) => h.category === 'Optional' || h.isOptional)
              .map((h) => {
                const isClaimed =
                  optedMap[h.id] !== undefined ? optedMap[h.id] : Boolean(h.userSelected);
                return (
                  <View
                    key={h.id}
                    style={[
                      styles.directoryCard,
                      {
                        backgroundColor: palette.surfaceMuted,
                        borderColor: palette.border,
                        marginTop: 12,
                      },
                    ]}
                  >
                    <View style={styles.directoryTop}>
                      <View style={styles.directoryMain}>
                        <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                          {h.name}
                        </Text>
                        <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                          {h.displayDate} · {h.location}
                        </Text>
                        <Text style={[styles.directoryDesc, { color: palette.textSecondary }]}>
                          {h.instructions || h.description}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          const nextVal = !isClaimed;
                          setOptedMap((prev) => ({ ...prev, [h.id]: nextVal }));
                          onSuccessToast(
                            nextVal
                              ? `Opted in for ${h.name}`
                              : `Released floating holiday ${h.name}`
                          );
                        }}
                        style={[
                          styles.optBtn,
                          {
                            backgroundColor: isClaimed ? palette.emerald : palette.primary,
                          },
                        ]}
                      >
                        <Text style={styles.optBtnText}>
                          {isClaimed ? 'Claimed' : 'Opt In'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
          </View>
        </View>
      ) : null}

      {/* 6. REPORTS & EXPORT VIEW */}
      {activeTab === 'reports' ? (
        <View style={styles.sectionStack}>
          {[
            {
              title: 'Statutory Compliance CSV Export',
              desc: 'Download complete 2026 holiday dataset with regional hub mappings.',
              action: 'Export CSV',
            },
            {
              title: 'Executive Printable PDF Calendar',
              desc: 'Formatted 2026 official circular signed by People Operations.',
              action: 'Generate PDF',
            },
            {
              title: 'iCal / Google / Outlook Calendar Feed',
              desc: 'Sync published OFC360 holidays directly to mobile calendar.',
              action: 'Sync iCal',
            },
          ].map((rep) => (
            <View
              key={rep.title}
              style={[
                styles.card,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{rep.title}</Text>
              <Text style={[styles.cardSub, { color: palette.textMuted, marginBottom: 12 }]}>
                {rep.desc}
              </Text>
              <Pressable
                onPress={() => onSuccessToast(`${rep.action} initiated for 2026 Calendar`)}
                style={[styles.primaryActionBtn, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.primaryActionBtnText}>{rep.action}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {/* 7. CALENDAR SETTINGS VIEW */}
      {activeTab === 'settings' ? (
        <View style={styles.sectionStack}>
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              Holiday Governance & Leave Rules
            </Text>
            {[
              {
                label: 'Auto-Lock Past Holiday Dates',
                sub: 'Prevent retrospective edits to completed statutory holidays',
                val: autoLockPast,
                toggle: () => setAutoLockPast(!autoLockPast),
              },
              {
                label: 'Auto-Sync with Attendance & Leave Engine',
                sub: 'Exclude published holidays from leave deduction calculations',
                val: syncLeaveEngine,
                toggle: () => setSyncLeaveEngine(!syncLeaveEngine),
              },
              {
                label: 'Substitute Holiday for Weekend Overlap',
                sub: 'Automatically credit compensatory off when National holiday falls on Sunday',
                val: weekendOverlapRule,
                toggle: () => setWeekendOverlapRule(!weekendOverlapRule),
              },
            ].map((rule) => (
              <Pressable
                key={rule.label}
                onPress={rule.toggle}
                style={[styles.settingRow, { borderBottomColor: palette.borderSubtle }]}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.holidayName, { color: palette.textPrimary }]}>
                    {rule.label}
                  </Text>
                  <Text style={[styles.holidayMeta, { color: palette.textMuted }]}>
                    {rule.sub}
                  </Text>
                </View>
                <View
                  style={[
                    styles.togglePill,
                    {
                      backgroundColor: rule.val ? palette.emerald : palette.surfaceMuted,
                      borderColor: rule.val ? palette.emerald : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      { color: rule.val ? '#FFFFFF' : palette.textMuted },
                    ]}
                  >
                    {rule.val ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* 3-DOT VIEW SWITCHER MODAL */}
      <Modal
        visible={isViewMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsViewMenuOpen(false)}
      >
        <Pressable
          onPress={() => setIsViewMenuOpen(false)}
          style={[styles.modalBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              styles.menuSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.menuHeaderTitle, { color: palette.textMuted }]}>
              SWITCH HOLIDAY MODULE VIEW
            </Text>
            {MODULE_TABS.map((tab) => {
              const active = activeTab === tab.id;
              const TabOptIcon = tab.Icon;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => {
                    setActiveTab(tab.id);
                    setIsViewMenuOpen(false);
                  }}
                  style={[
                    styles.menuOption,
                    {
                      backgroundColor: active ? palette.primaryLight : 'transparent',
                      borderColor: active ? palette.primary : palette.borderSubtle,
                    },
                  ]}
                >
                  <TabOptIcon
                    size={18}
                    color={active ? palette.primary : palette.textSecondary}
                    strokeWidth={2.2}
                  />
                  <View style={styles.menuOptionTextWrap}>
                    <Text
                      style={[
                        styles.menuOptionTitle,
                        { color: active ? palette.primary : palette.textPrimary },
                      ]}
                    >
                      {tab.label}
                    </Text>
                    <Text style={[styles.menuOptionSub, { color: palette.textMuted }]}>
                      {tab.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.catBadge,
                      {
                        backgroundColor: active ? palette.primary : palette.surfaceMuted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catBadgeText,
                        { color: active ? '#FFFFFF' : palette.textSecondary },
                      ]}
                    >
                      {tab.badge}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* ADD / EDIT HOLIDAY MODAL */}
      <Modal
        visible={isFormOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFormOpen(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: palette.overlay }]}>
          <View
            style={[
              styles.menuSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>
              {editingHoliday ? 'Edit Holiday' : 'Add Enterprise Holiday'}
            </Text>
            {formError ? (
              <Text style={[styles.errorText, { color: palette.rose }]}>{formError}</Text>
            ) : null}

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>
              HOLIDAY NAME *
            </Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g., Diwali / Deepavali"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>
              DATE (YYYY-MM-DD) *
            </Text>
            <TextInput
              value={formDate}
              onChangeText={setFormDate}
              placeholder="2026-11-15"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>CATEGORY</Text>
            <View style={styles.filterRow}>
              {(['National', 'Gazetted', 'Regional', 'Optional', 'Company'] as HolidayCategory[]).map(
                (cat) => {
                  const active = formCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setFormCategory(cat)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? palette.primary : palette.surfaceMuted,
                          borderColor: active ? palette.primary : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? '#FFFFFF' : palette.textSecondary },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>
              APPLICABLE LOCATION *
            </Text>
            <TextInput
              value={formLocation}
              onChangeText={setFormLocation}
              placeholder="India · All Hubs"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <Text style={[styles.inputLabel, { color: palette.textSecondary }]}>DESCRIPTION</Text>
            <TextInput
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Official observance notes..."
              placeholderTextColor={palette.textMuted}
              style={[
                styles.searchInput,
                {
                  backgroundColor: palette.surfaceMuted,
                  borderColor: palette.border,
                  color: palette.textPrimary,
                },
              ]}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setIsFormOpen(false)}
                style={[
                  styles.secondaryModalBtn,
                  { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.secondaryModalBtnText, { color: palette.textSecondary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveHoliday}
                disabled={isSaving}
                style={[styles.primaryModalBtn, { backgroundColor: palette.primary }]}
              >
                <Text style={styles.primaryActionBtnText}>
                  {isSaving ? 'Saving...' : 'Save Holiday'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* HOLIDAY DETAILS MODAL */}
      <Modal
        visible={Boolean(detailHoliday)}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailHoliday(null)}
      >
        <Pressable
          onPress={() => setDetailHoliday(null)}
          style={[styles.modalBackdrop, { backgroundColor: palette.overlay }]}
        >
          {detailHoliday ? (
            <View
              style={[
                styles.menuSheet,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.activeViewLabel, { color: palette.primary }]}>
                {detailHoliday.category.toUpperCase()} HOLIDAY
              </Text>
              <Text style={[styles.cardTitle, { color: palette.textPrimary, marginTop: 4 }]}>
                {detailHoliday.name}
              </Text>
              <Text style={[styles.cardSub, { color: palette.textMuted, marginBottom: 12 }]}>
                {detailHoliday.displayDate} ({detailHoliday.dayOfWeek}) · {detailHoliday.location}
              </Text>
              <Text style={[styles.directoryDesc, { color: palette.textSecondary }]}>
                {detailHoliday.description}
              </Text>
              {detailHoliday.instructions ? (
                <View
                  style={[
                    styles.instructionBox,
                    { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
                  ]}
                >
                  <Text style={[styles.holidayMeta, { color: palette.textPrimary }]}>
                    HR Instructions: {detailHoliday.instructions}
                  </Text>
                </View>
              ) : null}
              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setDetailHoliday(null)}
                  style={[styles.primaryModalBtn, { backgroundColor: palette.primary }]}
                >
                  <Text style={styles.primaryActionBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  topCard: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    padding: 16,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topTitleWrap: {
    flex: 1,
  },
  activeViewLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '500',
  },
  activeViewTitle: {
    fontFamily: FONT_SANS,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 2,
  },
  activeViewSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  threeDotBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionStack: {
    gap: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  kpiLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginVertical: 4,
  },
  kpiHint: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '400',
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: FONT_SANS,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  linkText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 132,
    paddingTop: 18,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 76,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  typeList: {
    marginTop: 12,
    gap: 10,
  },
  typeItem: {
    gap: 6,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeName: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '500',
  },
  typeCount: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeMonth: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    fontWeight: '600',
  },
  dateBadgeDay: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 14,
    fontWeight: '600',
  },
  timelineInfo: {
    flex: 1,
  },
  holidayName: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  holidayMeta: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '500',
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '600',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderDay: {
    fontFamily: FONT_SANS,
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    height: 44,
    borderWidth: 0.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayNum: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 13,
  },
  holidayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
  monthHolidaysSection: {
    marginTop: 14,
  },
  subHeading: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    paddingVertical: 12,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearMonthCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  yearMonthTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  yearMonthCount: {
    fontFamily: FONT_SANS,
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 4,
  },
  yearMonthItem: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    marginTop: 2,
  },
  searchInput: {
    fontFamily: FONT_SANS,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '500',
  },
  clearFilterBanner: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  clearFilterText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  resultCount: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginBottom: 8,
  },
  directoryCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  directoryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  directoryMain: {
    flex: 1,
  },
  directoryDesc: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 4,
  },
  directoryActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  dirActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dirActionText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  hubBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  optBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryActionBtn: {
    height: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  togglePillText: {
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuSheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  menuHeaderTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  menuOptionTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  menuOptionTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  menuOptionSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  errorText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  secondaryModalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryModalBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryModalBtn: {
    flex: 1.5,
    height: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBox: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyBox: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
});
