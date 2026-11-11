'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  HolidayItem,
  HolidayCategory,
  HolidayType,
  filterHolidays,
} from '@/lib/hr-dashboard-logic';
import {
  Calendar,
  List,
  Grid3X3,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Globe,
  Building2,
  MapPin,
  Users,
  Bell,
  FileText,
  Download,
  Printer,
  Settings,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  PieChart,
  Tag,
  CheckSquare,
  Lock,
  Layers,
  HelpCircle,
  Briefcase,
  UserCheck,
  CalendarDays,
  SlidersHorizontal,
  MoreVertical,
} from 'lucide-react';

interface HolidayCalendarModuleProps {
  initialHolidays: HolidayItem[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
  onNavigateHomeTab?: (tab: any) => void;
}

export type ModuleViewTab =
  | 'dashboard'
  | 'calendar'
  | 'management_table'
  | 'location_hub'
  | 'optional_hub'
  | 'reports'
  | 'settings';

export const LOCATIONS_LIST = [
  'All Locations',
  'Jaipur',
  'Bangalore',
  'Hyderabad',
  'Delhi',
  'Global',
];

export const DEPARTMENTS_LIST = [
  'All Departments',
  'Engineering',
  'People Operations / HR',
  'Enterprise Sales',
  'Finance & Legal',
  'Product & Design',
  'Customer Success',
  'Operations',
];

export function getCategoryBadgeStyle(category: HolidayCategory) {
  switch (category) {
    case 'National':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Gazetted':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'Regional':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Optional':
    case 'Restricted':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Company':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

export function getCategoryPillColor(category: HolidayCategory) {
  switch (category) {
    case 'National':
      return 'bg-emerald-500';
    case 'Gazetted':
      return 'bg-indigo-500';
    case 'Regional':
      return 'bg-amber-500';
    case 'Optional':
    case 'Restricted':
      return 'bg-purple-500';
    case 'Company':
      return 'bg-sky-500';
    default:
      return 'bg-slate-500';
  }
}

export function getMonthCalendarDays(
  year: number,
  monthIndex: number,
  weekStartSunday: boolean = true
) {
  const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const days: Array<{
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    dayName: string;
  }> = [];

  const todayStr = new Date().toISOString().split('T')[0];

  const paddingBefore = weekStartSunday
    ? firstDayIndex
    : firstDayIndex === 0
    ? 6
    : firstDayIndex - 1;

  for (let i = paddingBefore - 1; i >= 0; i--) {
    const pDay = prevMonthDays - i;
    const pMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const pYear = monthIndex === 0 ? year - 1 : year;
    const dStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(
      pDay
    ).padStart(2, '0')}`;
    days.push({
      dateStr: dStr,
      dayNum: pDay,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        new Date(pYear, pMonth, pDay).getDay()
      ],
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(
      d
    ).padStart(2, '0')}`;
    days.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        new Date(year, monthIndex, d).getDay()
      ],
    });
  }

  const totalGridCells = days.length <= 35 ? 35 : 42;
  const remaining = totalGridCells - days.length;
  for (let n = 1; n <= remaining; n++) {
    const nMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const nYear = monthIndex === 11 ? year + 1 : year;
    const dStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(
      n
    ).padStart(2, '0')}`;
    days.push({
      dateStr: dStr,
      dayNum: n,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
        new Date(nYear, nMonth, n).getDay()
      ],
    });
  }

  return days;
}

export function exportHolidaysCsv(holidays: HolidayItem[]) {
  const headers = [
    'ID',
    'Name',
    'Date',
    'Day',
    'Category',
    'Location',
    'Departments',
    'Status',
    'Description',
  ];
  const rows = holidays.map((h) => [
    h.id,
    `"${h.name.replace(/"/g, '""')}"`,
    h.date,
    h.dayOfWeek,
    h.category,
    `"${h.location.replace(/"/g, '""')}"`,
    `"${(h.departments || ['All Departments']).join(', ')}"`,
    h.status || 'Published',
    `"${(h.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `OFC360_Enterprise_Holiday_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function HolidayCalendarModule({
  initialHolidays,
  canEdit,
  onSuccessToast,
}: HolidayCalendarModuleProps) {
  // Local mutable holidays state
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);

  // Active Main Navigation View Tab
  const [activeTab, setActiveTab] = useState<ModuleViewTab>('dashboard');

  // 3-Dot Navigation Menu Popover State
  const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);
  const navMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setIsNavMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User View Role Mode
  const [userRoleMode, setUserRoleMode] = useState<'hr_admin' | 'employee'>(
    'hr_admin'
  );

  // Filters & State
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] =
    useState<string>('All Locations');
  const [selectedCategory, setSelectedCategory] = useState<
    HolidayCategory | 'All'
  >('All');
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>('All Departments');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar View Specific state (Month, Year, List)
  const [calendarViewMode, setCalendarViewMode] = useState<
    'month' | 'year' | 'list'
  >('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 10, 1)); // Default Nov 2026

  // Drawer / Modals State
  const [drawerHoliday, setDrawerHoliday] = useState<HolidayItem | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [formHoliday, setFormHoliday] = useState<Partial<HolidayItem> | null>(
    null
  );
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Notification Drawer State
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState<boolean>(false);

  // Printable Report Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [reportType, setReportType] = useState<
    'Annual' | 'Monthly' | 'Location' | 'Type' | 'Optional'
  >('Annual');

  // Optional Holiday Claim Confirm Modal
  const [optInHoliday, setOptInHoliday] = useState<HolidayItem | null>(null);

  // Management Table Column Visibility Controls
  const [columnVisibility, setColumnVisibility] = useState({
    date: true,
    day: true,
    type: true,
    location: true,
    departments: true,
    employeeCategory: true,
    recurring: true,
    status: true,
  });

  // Settings
  const [settings, setSettings] = useState({
    defaultYear: '2026',
    weekStart: 'Sunday',
    showWeekends: true,
    compactView: false,
    autoApproveOptional: true,
  });

  // Filtered Holidays
  const filteredList = useMemo(() => {
    return filterHolidays(
      holidays,
      selectedCategory,
      selectedMonth,
      selectedLocation === 'All Locations' ? 'All' : selectedLocation,
      selectedDepartment === 'All Departments' ? 'All' : selectedDepartment,
      searchQuery,
      selectedStatus,
      false,
      selectedYear
    );
  }, [
    holidays,
    selectedCategory,
    selectedMonth,
    selectedLocation,
    selectedDepartment,
    searchQuery,
    selectedStatus,
    selectedYear,
  ]);

  // Key KPI Numbers
  const totalCount = holidays.length;
  const upcomingHolidays = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return holidays
      .filter((h) => h.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays]);

  const nationalCount = holidays.filter(
    (h) => h.category === 'National' || h.category === 'Gazetted'
  ).length;
  const regionalCount = holidays.filter(
    (h) => h.category === 'Regional'
  ).length;
  const optionalCount = holidays.filter(
    (h) => h.category === 'Optional' || h.isOptional
  ).length;

  // Next Upcoming Holiday Banner
  const nextHoliday = upcomingHolidays[0] || holidays[0];

  // Location Hub Data
  const locationsData = useMemo(() => {
    const locs = ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'];
    return locs.map((loc) => {
      const locHolidays = holidays.filter(
        (h) =>
          h.location.toLowerCase().includes(loc.toLowerCase()) ||
          (h.locations &&
            h.locations.some((l) => l.toLowerCase() === loc.toLowerCase()))
      );
      const nextLocHoliday = locHolidays
        .filter((h) => h.date >= new Date().toISOString().split('T')[0])
        .sort((a, b) => a.date.localeCompare(b.date))[0];

      return {
        locationName: loc,
        total: locHolidays.length,
        nextHoliday: nextLocHoliday ? nextLocHoliday.name : 'None Scheduled',
        nextDate: nextLocHoliday ? nextLocHoliday.displayDate : 'N/A',
        hrLead: `${loc} People Ops Team`,
      };
    });
  }, [holidays]);

  // Notifications Feed
  const notificationsList = useMemo(() => {
    return [
      {
        id: 'NOTIF-01',
        title: 'New Holiday Published',
        message: 'Diwali / Deepavali Festival published for India Hubs.',
        time: '2 hours ago',
        type: 'new',
      },
      {
        id: 'NOTIF-02',
        title: 'Optional Holiday Deadline Approaching',
        message:
          'Selection window for Guru Nanak Jayanti closes on Nov 15, 2026.',
        time: '1 day ago',
        type: 'deadline',
      },
      {
        id: 'NOTIF-03',
        title: 'Holiday Schedule Updated',
        message: 'Govardhan Puja location list updated to include Jaipur HQ.',
        time: '3 days ago',
        type: 'update',
      },
      {
        id: 'NOTIF-04',
        title: 'Upcoming Statutory Holiday Reminder',
        message:
          'Year-End Winter Shutdown scheduled for Dec 25 across all hubs.',
        time: '5 days ago',
        type: 'reminder',
      },
    ];
  }, []);

  // CRUD Handlers
  const handleOpenAddForm = (datePreset?: string) => {
    setFormHoliday({
      id: '',
      name: '',
      date: datePreset || '2026-11-15',
      displayDate: '',
      month: 'November',
      dayOfWeek: 'Sunday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: '',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Standard enterprise paid holiday rules apply.',
    });
    setDuplicateWarning(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditForm = (item: HolidayItem) => {
    setFormHoliday({ ...item });
    setDuplicateWarning(null);
    setIsAddEditModalOpen(true);
  };

  const handleDuplicateHoliday = (item: HolidayItem) => {
    const dup: HolidayItem = {
      ...item,
      id: `HOL-${Date.now().toString().slice(-4)}`,
      name: `${item.name} (Copy)`,
      status: 'Draft',
    };
    setHolidays((prev) => [dup, ...prev]);
    onSuccessToast(`Duplicated "${item.name}" as draft holiday.`);
  };

  const handleTogglePublish = (id: string) => {
    setHolidays((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const newStatus = h.status === 'Published' ? 'Draft' : 'Published';
          onSuccessToast(
            `Holiday "${h.name}" marked as ${newStatus.toLowerCase()}.`
          );
          return { ...h, status: newStatus };
        }
        return h;
      })
    );
  };

  const handleDeleteHoliday = (id: string, name: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    if (drawerHoliday?.id === id) setDrawerHoliday(null);
    onSuccessToast(`Removed "${name}" from holiday schedule.`);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHoliday?.name || !formHoliday?.date) return;

    // Check duplicate date warning
    const exists = holidays.some(
      (h) => h.date === formHoliday.date && h.id !== formHoliday.id
    );
    if (exists && !duplicateWarning) {
      setDuplicateWarning(
        `Note: A holiday is already configured on ${formHoliday.date}. Click "Confirm Save" to proceed anyway.`
      );
      return;
    }

    const dateObj = new Date(formHoliday.date);
    const monthNames = [
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
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const updatedMonth = monthNames[dateObj.getMonth()];
    const updatedDayOfWeek = dayNames[dateObj.getDay()];
    const updatedDisplayDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const isEdit = Boolean(formHoliday.id);
    const idToUse = formHoliday.id || `HOL-${String(holidays.length + 1).padStart(2, '0')}`;

    const completeHoliday: HolidayItem = {
      id: idToUse,
      name: formHoliday.name,
      date: formHoliday.date,
      displayDate: updatedDisplayDate,
      month: updatedMonth,
      dayOfWeek: updatedDayOfWeek,
      category: formHoliday.category || 'National',
      location: formHoliday.location || 'Global · All Hubs',
      locations: formHoliday.locations || ['Global'],
      departments: formHoliday.departments || ['All Departments'],
      employeeCategory: formHoliday.employeeCategory || 'All Employees',
      description: formHoliday.description || 'Enterprise statutory holiday.',
      recurring: formHoliday.recurring ?? true,
      isOptional: formHoliday.isOptional ?? false,
      status: formHoliday.status || 'Published',
      instructions:
        formHoliday.instructions || 'Standard holiday guidelines apply.',
      createdDate: formHoliday.createdDate || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    if (isEdit) {
      setHolidays((prev) =>
        prev.map((h) => (h.id === idToUse ? completeHoliday : h))
      );
      onSuccessToast(`Updated holiday "${completeHoliday.name}".`);
    } else {
      setHolidays((prev) => [completeHoliday, ...prev]);
      onSuccessToast(`Added new holiday "${completeHoliday.name}".`);
    }

    setIsAddEditModalOpen(false);
    setFormHoliday(null);
    setDuplicateWarning(null);
  };

  const handleToggleOptIn = (item: HolidayItem) => {
    setHolidays((prev) =>
      prev.map((h) => {
        if (h.id === item.id) {
          const newSelected = !h.userSelected;
          const newCount = (h.optedInCount || 0) + (newSelected ? 1 : -1);
          onSuccessToast(
            newSelected
              ? `Opted in to "${h.name}". Floating holiday claim recorded.`
              : `Opt-out confirmed for "${h.name}".`
          );
          return { ...h, userSelected: newSelected, optedInCount: newCount };
        }
        return h;
      })
    );
    setOptInHoliday(null);
  };

  // Monthly Calendar Matrix Day Generator
  const calYear = calendarDate.getFullYear();
  const calMonthIdx = calendarDate.getMonth();
  const calendarDays = useMemo(
    () => getMonthCalendarDays(calYear, calMonthIdx, settings.weekStart === 'Sunday'),
    [calYear, calMonthIdx, settings.weekStart]
  );

  return (
    <div
      className="space-y-6 text-slate-900 dark:text-slate-100"
      data-testid="enterprise-holiday-calendar-module"
    >
      {/* CLEAN HEADER WITH 3-DOT MENU SELECTOR & ACTIONS */}
      <div
        className="relative flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs"
        ref={navMenuRef}
      >
        {/* 3-Dot Dropdown View Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNavMenuOpen((prev) => !prev)}
            data-testid="module-nav-3dot-btn"
            title="Switch Holiday View Options"
            aria-expanded={isNavMenuOpen}
            className="min-h-[40px] px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <MoreVertical className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-bold text-sm">
              {[
                { id: 'dashboard', label: 'Dashboard & Analytics' },
                { id: 'calendar', label: 'Interactive Calendar' },
                { id: 'management_table', label: 'Holiday Directory Table' },
                { id: 'location_hub', label: 'Location Hub' },
                { id: 'optional_hub', label: 'Optional Holidays' },
                { id: 'reports', label: 'Reports & Export' },
                { id: 'settings', label: 'Calendar Settings' },
              ].find((t) => t.id === activeTab)?.label || 'Dashboard & Analytics'}
            </span>
          </button>

          {/* 3-Dot Dropdown Menu Popover */}
          {isNavMenuOpen && (
            <div
              data-testid="module-nav-3dot-menu"
              className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Select View
              </div>
              {[
                {
                  id: 'dashboard',
                  label: 'Dashboard & Analytics',
                  icon: BarChart3,
                  desc: 'Live KPI cards & monthly analytics',
                },
                {
                  id: 'calendar',
                  label: 'Interactive Calendar',
                  icon: Calendar,
                  desc: 'Month, Year & Agenda List views',
                },
                {
                  id: 'management_table',
                  label: 'Holiday Directory Table',
                  icon: List,
                  desc: 'Full holiday list & status controls',
                },
                {
                  id: 'location_hub',
                  label: 'Location Hub',
                  icon: MapPin,
                  desc: 'Office branch holiday allocation',
                },
                {
                  id: 'optional_hub',
                  label: 'Optional Holidays',
                  icon: CheckSquare,
                  desc: 'Floating leave opt-in & quota',
                },
                {
                  id: 'reports',
                  label: 'Reports & Export',
                  icon: FileText,
                  desc: 'Download CSV & printable PDF',
                },
                {
                  id: 'settings',
                  label: 'Calendar Settings',
                  icon: Settings,
                  desc: 'Week start & automated rules',
                },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as ModuleViewTab);
                      setIsNavMenuOpen(false);
                    }}
                    data-testid={`3dot-option-${item.id}`}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isCurrent
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <div className="truncate">
                        <p className="truncate font-bold">{item.label}</p>
                        <p className="text-[10px] font-normal text-slate-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHolidaysCsv(filteredList)}
            data-testid="export-csv-btn"
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              data-testid="global-add-holiday-btn"
              className="min-h-[40px] px-4 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: DYNAMIC DASHBOARD & ANALYTICS TAB (LIVE CALCULATED DATA) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" data-testid="holiday-dashboard-section">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Holidays */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocation('All Locations');
                setActiveTab('management_table');
              }}
              data-testid="kpi-total-holidays"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Holidays
                </span>
                <Calendar className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {totalCount}
              </p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                {selectedYear} Calendar Year
              </span>
            </button>

            {/* Upcoming Holidays */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('calendar');
              }}
              data-testid="kpi-upcoming-holidays"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Upcoming
                </span>
                <Clock className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {upcomingHolidays.length}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                Remaining in year
              </span>
            </button>

            {/* National & Gazetted */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('National');
                setActiveTab('management_table');
              }}
              data-testid="kpi-national-holidays"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  National
                </span>
                <Globe className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {nationalCount}
              </p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                Statutory Mandated
              </span>
            </button>

            {/* Regional */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Regional');
                setActiveTab('management_table');
              }}
              data-testid="kpi-regional-holidays"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Regional
                </span>
                <MapPin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {regionalCount}
              </p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                Hub specific
              </span>
            </button>

            {/* Optional / Restricted */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('optional_hub');
              }}
              data-testid="kpi-optional-holidays"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Optional
                </span>
                <CheckSquare className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-purple-600 dark:text-purple-400">
                {optionalCount}
              </p>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block">
                Floating selection
              </span>
            </button>

            {/* Office Locations */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('location_hub');
              }}
              data-testid="kpi-office-locations"
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-left transition-all cursor-pointer space-y-2 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Office Hubs
                </span>
                <Building2 className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-sky-600 dark:text-sky-400">
                {locationsData.length}
              </p>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block">
                Configured Hubs
              </span>
            </button>
          </div>

          {/* Interactive Analytics Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Dynamic Monthly Distribution & Category Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dynamic Monthly Distribution Chart */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Monthly Holiday Distribution ({selectedYear})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated dynamically from live active holiday list
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    12 Months Matrix
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-1.5 items-end h-40 pt-4">
                  {[
                    { m: 'Jan', idx: 0 },
                    { m: 'Feb', idx: 1 },
                    { m: 'Mar', idx: 2 },
                    { m: 'Apr', idx: 3 },
                    { m: 'May', idx: 4 },
                    { m: 'Jun', idx: 5 },
                    { m: 'Jul', idx: 6 },
                    { m: 'Aug', idx: 7 },
                    { m: 'Sep', idx: 8 },
                    { m: 'Oct', idx: 9 },
                    { m: 'Nov', idx: 10 },
                    { m: 'Dec', idx: 11 },
                  ].map((monthItem) => {
                    const monthHolidays = holidays.filter((h) => {
                      const d = new Date(h.date);
                      return !isNaN(d.getTime()) && d.getMonth() === monthItem.idx;
                    });
                    const count = monthHolidays.length;
                    const maxCount = 5;
                    const heightPct = count === 0 ? 8 : Math.min(100, (count / maxCount) * 100);

                    return (
                      <div
                        key={monthItem.m}
                        className="flex flex-col items-center gap-1.5 group h-full justify-end"
                      >
                        <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                          {count}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            count > 0
                              ? 'bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-500'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {monthItem.m}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Category Breakdown Bar */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Holiday Category Breakdown
                </h3>

                <div className="space-y-3">
                  {[
                    { label: 'National Statutory', category: 'National', color: 'bg-emerald-500' },
                    { label: 'Gazetted Festival', category: 'Gazetted', color: 'bg-indigo-500' },
                    { label: 'Regional Branch Observance', category: 'Regional', color: 'bg-amber-500' },
                    { label: 'Optional / Floating Leave', category: 'Optional', color: 'bg-purple-500' },
                    { label: 'Company Town Hall & Rest', category: 'Company', color: 'bg-sky-500' },
                  ].map((cat) => {
                    const count = holidays.filter((h) => h.category === cat.category).length;
                    const total = totalCount || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cat.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {cat.label}
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {count} holidays ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${cat.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live Upcoming Timeline Widget */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Upcoming Holidays Timeline</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    View Calendar &rarr;
                  </button>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {upcomingHolidays.slice(0, 5).map((h) => (
                    <div
                      key={h.id}
                      onClick={() => setDrawerHoliday(h)}
                      className="pt-3 first:pt-0 flex items-start gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono flex flex-col items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                        <span className="text-[9px] uppercase font-bold">
                          {h.month.slice(0, 3)}
                        </span>
                        <span className="text-sm font-bold leading-tight">
                          {h.date.split('-')[2]}
                        </span>
                      </div>

                      <div className="min-w-0 space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(
                              h.category
                            )}`}
                          >
                            {h.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {h.dayOfWeek}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                          {h.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          📍 {h.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: INTERACTIVE CALENDAR TAB (Month, Year, List Views) */}
      {/* ========================================================================= */}
      {activeTab === 'calendar' && (
        <div className="space-y-5" data-testid="interactive-calendar-section">
          {/* Calendar Controls & Filters Bar */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            {/* View Switcher: Month / Year / List */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setCalendarViewMode('month')}
                data-testid="cal-view-month-btn"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  calendarViewMode === 'month'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Month View</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('year')}
                data-testid="cal-view-year-btn"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  calendarViewMode === 'year'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Year Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarViewMode('list')}
                data-testid="cal-view-list-btn"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  calendarViewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Agenda Feed</span>
              </button>
            </div>

            {/* Date Navigation Controls */}
            {calendarViewMode === 'month' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calYear, calMonthIdx - 1, 1)
                    )
                  }
                  data-testid="prev-month-btn"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <h3 className="text-sm font-bold min-w-[130px] text-center font-mono text-slate-900 dark:text-white">
                  {calendarDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(
                      new Date(calYear, calMonthIdx + 1, 1)
                    )
                  }
                  data-testid="next-month-btn"
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date(2026, 10, 1))}
                  data-testid="today-btn"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Current Date
                </button>
              </div>
            )}

            {/* Location & Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                data-testid="cal-location-select"
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                {LOCATIONS_LIST.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as HolidayCategory | 'All')
                }
                data-testid="cal-category-select"
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="All">All Types</option>
                <option value="National">National</option>
                <option value="Gazetted">Gazetted</option>
                <option value="Regional">Regional</option>
                <option value="Optional">Optional / Restricted</option>
                <option value="Company">Company</option>
              </select>
            </div>
          </div>

          {/* MONTH GRID VIEW */}
          {calendarViewMode === 'month' && (
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 dark:border-slate-800 pb-2">
                {(settings.weekStart === 'Sunday'
                  ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                  : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                ).map((day) => (
                  <span
                    key={day}
                    className="text-xs font-extrabold font-mono text-slate-400 uppercase tracking-wider"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((cell, idx) => {
                  const dayHolidays = filteredList.filter(
                    (h) => h.date === cell.dateStr
                  );

                  return (
                    <div
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => {
                        if (dayHolidays.length === 0 && canEdit) {
                          handleOpenAddForm(cell.dateStr);
                        }
                      }}
                      className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                        cell.isCurrentMonth
                          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-indigo-300'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-transparent opacity-40'
                      } ${
                        cell.isToday
                          ? 'ring-2 ring-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                            cell.isToday
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                        {dayHolidays.length === 0 && canEdit && (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 hover:text-indigo-600 cursor-pointer">
                            + Add
                          </span>
                        )}
                      </div>

                      {/* Holiday Pills */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {dayHolidays.map((h) => (
                          <div
                            key={h.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerHoliday(h);
                            }}
                            className={`p-1 sm:p-1.5 rounded-lg border text-[10px] font-bold leading-tight truncate cursor-pointer transition-transform hover:scale-102 ${getCategoryBadgeStyle(
                              h.category
                            )}`}
                          >
                            <span className="truncate block">🎉 {h.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] font-mono text-slate-400 truncate">
                        {dayHolidays.length > 0 ? `${dayHolidays.length} Holiday` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* YEAR MATRIX VIEW */}
          {calendarViewMode === 'year' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
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
              ].map((mName, mIdx) => {
                const monthHols = filteredList.filter(
                  (h) => h.month === mName
                );
                return (
                  <div
                    key={mName}
                    onClick={() => {
                      setCalendarDate(new Date(2026, mIdx, 1));
                      setCalendarViewMode('month');
                    }}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 transition-all cursor-pointer space-y-3 shadow-2xs group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {mName} 2026
                      </h4>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                        {monthHols.length} Holidays
                      </span>
                    </div>

                    <div className="space-y-1.5 min-h-[90px]">
                      {monthHols.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-4 text-center italic">
                          No holidays
                        </p>
                      ) : (
                        monthHols.map((h) => (
                          <div
                            key={h.id}
                            className="text-xs flex items-center justify-between gap-1 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {h.name}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                              {h.date.split('-')[2]} {mName.slice(0, 3)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AGENDA LIST VIEW */}
          {calendarViewMode === 'list' && (
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chronological Agenda List ({filteredList.length})
                </h3>
                <span className="text-xs text-slate-500">Sorted by Date</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
                {filteredList.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setDrawerHoliday(h)}
                    className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex flex-col items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                        <span className="text-[9px] uppercase">{h.month.slice(0, 3)}</span>
                        <span className="text-sm">{h.date.split('-')[2]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(
                              h.category
                            )}`}
                          >
                            {h.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {h.dayOfWeek}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {h.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          📍 {h.location} · {h.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 self-end sm:self-center"
                    >
                      Details &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: HOLIDAY DIRECTORY TABLE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'management_table' && (
        <div className="space-y-4" data-testid="holiday-management-table-section">
          {/* Table Controls Header */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="table-search-input"
                placeholder="Search holiday name, description, location..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as HolidayCategory | 'All')
                }
                data-testid="table-filter-category"
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="All">All Categories</option>
                <option value="National">National</option>
                <option value="Gazetted">Gazetted</option>
                <option value="Regional">Regional</option>
                <option value="Optional">Optional / Restricted</option>
                <option value="Company">Company</option>
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                data-testid="table-filter-location"
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                {LOCATIONS_LIST.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                data-testid="table-filter-status"
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-extrabold font-mono text-slate-500 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Holiday Name</th>
                  <th className="p-3.5">Date &amp; Day</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Applicable Location</th>
                  <th className="p-3.5">Recurring</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No matching holidays found for the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr
                      key={item.id}
                      data-testid={`holiday-row-${item.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>🎉</span>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {item.displayDate} ({item.dayOfWeek.slice(0, 3)})
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        📍 {item.location}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[11px]">
                          {item.recurring ? 'Yes (Annual)' : 'One-time'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.status || 'Published'}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDrawerHoliday(item)}
                            title="View Details"
                            data-testid={`view-row-${item.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && userRoleMode === 'hr_admin' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditForm(item)}
                                title="Edit"
                                data-testid={`edit-row-${item.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-indigo-600 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateHoliday(item)}
                                title="Duplicate"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-sky-600 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(item.id)}
                                title="Toggle Publish"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-emerald-600 cursor-pointer"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteHoliday(item.id, item.name)
                                }
                                title="Delete"
                                data-testid={`delete-row-${item.id}`}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 text-rose-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION D: LOCATION HUB TAB */}
      {/* ========================================================================= */}
      {activeTab === 'location_hub' && (
        <div className="space-y-6" data-testid="location-hub-section">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Location-wise Enterprise Holiday Schedules
            </h3>
            <p className="text-xs text-slate-500">
              Configure and audit statutory holiday calendars specific to regional office campuses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationsData.map((loc) => (
              <div
                key={loc.locationName}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {loc.locationName} Hub
                      </h4>
                      <p className="text-[11px] text-slate-500">{loc.hrLead}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg">
                    {loc.total} Holidays
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Next Upcoming Holiday:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {loc.nextHoliday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {loc.nextDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc.locationName);
                    setActiveTab('management_table');
                  }}
                  className="w-full min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  View {loc.locationName} Schedule &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION E: OPTIONAL HOLIDAY HUB TAB */}
      {/* ========================================================================= */}
      {activeTab === 'optional_hub' && (
        <div className="space-y-6" data-testid="optional-holiday-hub-section">
          {/* Quota Banner */}
          <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-white dark:from-purple-950/40 dark:via-slate-900 text-slate-900 dark:text-slate-100 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  Annual Employee Allowance
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Restricted / Floating Holiday Selection Window (2026)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Employees can opt-in to 2 floating holidays per calendar year.
                </p>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-center shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Your Allowance
                </span>
                <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">
                  2 Max / 1 Claimed
                </span>
              </div>
            </div>
          </div>

          {/* Optional Holidays List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Available Restricted Holidays ({optionalCount})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holidays
                .filter((h) => h.category === 'Optional' || h.isOptional)
                .map((item) => (
                  <div
                    key={item.id}
                    data-testid={`optional-card-${item.id}`}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-mono font-bold flex flex-col items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
                          <span className="text-[9px] uppercase">
                            {item.month.slice(0, 3)}
                          </span>
                          <span className="text-sm">{item.date.split('-')[2]}</span>
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200">
                            Restricted Floating
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Deadline: {item.selectionDeadline || 'Nov 15, 2026'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.userSelected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.userSelected ? 'Selected ✓' : 'Available'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-mono">
                        👥 {item.optedInCount || 24} staff opted in
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleOptIn(item)}
                        data-testid={`opt-in-btn-${item.id}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          item.userSelected
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                            : 'bg-purple-600 text-white hover:bg-purple-500 shadow-xs'
                        }`}
                      >
                        {item.userSelected ? 'Opt Out' : 'Claim Floating Rest'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION F: REPORTS & EXPORT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6" data-testid="reports-export-section">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enterprise Holiday Audit &amp; Compliance Reports
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'Annual',
                  title: '2026 Annual Master Schedule Report',
                  desc: 'Complete list of all 19 statutory and company holidays.',
                },
                {
                  id: 'Monthly',
                  title: 'Monthly Shift Impact Report',
                  desc: 'Breakdown of holiday rest days per month for roster planning.',
                },
                {
                  id: 'Location',
                  title: 'Location-wise Statutory Compliance Report',
                  desc: 'Audit for Jaipur, BLR, HYD, DEL labor law requirements.',
                },
                {
                  id: 'Type',
                  title: 'Gazetted vs Optional Classification Summary',
                  desc: 'Categorized breakdown for payroll & overtime calculation.',
                },
                {
                  id: 'Optional',
                  title: 'Employee Floating Holiday Opt-in Log',
                  desc: 'Individual employee claims for restricted floating days.',
                },
              ].map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rep.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{rep.desc}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => exportHolidaysCsv(filteredList)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportType(rep.id as any);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION G: CALENDAR SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6" data-testid="calendar-settings-section">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Calendar Display &amp; Governance Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">
                    Default Calendar Year
                  </label>
                  <select
                    value={settings.defaultYear}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultYear: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold"
                  >
                    <option value="2026">2026 Calendar Year</option>
                    <option value="2027">2027 Calendar Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    Week Start Day
                  </label>
                  <select
                    value={settings.weekStart}
                    onChange={(e) =>
                      setSettings({ ...settings, weekStart: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Display Weekends in Calendar Grid
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.showWeekends}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        showWeekends: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Auto-approve Employee Floating Holiday Opt-Ins
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.autoApproveOptional}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoApproveOptional: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onSuccessToast('Calendar preferences saved.')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: HOLIDAY DETAILS */}
      {/* ========================================================================= */}
      {drawerHoliday && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div
            data-testid="holiday-details-drawer"
            className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 space-y-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getCategoryBadgeStyle(
                    drawerHoliday.category
                  )}`}
                >
                  {drawerHoliday.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {drawerHoliday.id}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDrawerHoliday(null)}
                aria-label="Close details drawer"
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  🎉 {drawerHoliday.name}
                </h2>
                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  📅 {drawerHoliday.displayDate} ({drawerHoliday.dayOfWeek})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">
                    Applicable Location(s):
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    📍 {drawerHoliday.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">
                    Target Departments:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {(drawerHoliday.departments || ['All Departments']).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">
                    Employee Category:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {drawerHoliday.employeeCategory || 'All Employees'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {drawerHoliday.description}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Employee Guidelines &amp; Instructions
                </span>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50">
                  {drawerHoliday.instructions || 'Standard holiday rules apply.'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Recurring: {drawerHoliday.recurring ? 'Yes' : 'No'}</span>
                <span>Status: {drawerHoliday.status || 'Published'}</span>
              </div>
            </div>

            {/* Action buttons */}
            {canEdit && userRoleMode === 'hr_admin' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditForm(drawerHoliday);
                    setDrawerHoliday(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Edit Holiday
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteHoliday(drawerHoliday.id, drawerHoliday.name)
                  }
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 text-xs font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT HOLIDAY FORM */}
      {/* ========================================================================= */}
      {isAddEditModalOpen && formHoliday && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            data-testid="add-edit-holiday-modal"
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {formHoliday.id ? 'Edit Holiday Schedule' : 'Add New Corporate Holiday'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  value={formHoliday.name || ''}
                  onChange={(e) =>
                    setFormHoliday({ ...formHoliday, name: e.target.value })
                  }
                  placeholder="e.g. Constitutional Day Observance"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Holiday Date *</label>
                  <input
                    type="date"
                    required
                    value={formHoliday.date || ''}
                    onChange={(e) =>
                      setFormHoliday({ ...formHoliday, date: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category / Type *</label>
                  <select
                    value={formHoliday.category || 'National'}
                    onChange={(e) =>
                      setFormHoliday({
                        ...formHoliday,
                        category: e.target.value as HolidayCategory,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-semibold"
                  >
                    <option value="National">National Statutory</option>
                    <option value="Gazetted">Gazetted Festival</option>
                    <option value="Regional">Regional Branch</option>
                    <option value="Optional">Optional / Restricted</option>
                    <option value="Company">Company Town Hall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Applicable Office Location</label>
                <input
                  type="text"
                  value={formHoliday.location || ''}
                  onChange={(e) =>
                    setFormHoliday({ ...formHoliday, location: e.target.value })
                  }
                  placeholder="e.g. Jaipur · Delhi · Bangalore"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  value={formHoliday.description || ''}
                  onChange={(e) =>
                    setFormHoliday({
                      ...formHoliday,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Brief description of holiday observance..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formHoliday.recurring ?? true}
                    onChange={(e) =>
                      setFormHoliday({
                        ...formHoliday,
                        recurring: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Recurring Every Year</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formHoliday.isOptional ?? false}
                    onChange={(e) =>
                      setFormHoliday({
                        ...formHoliday,
                        isOptional: e.target.checked,
                        category: e.target.checked
                          ? 'Optional'
                          : formHoliday.category,
                      })
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Optional Floating Holiday</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="save-holiday-form-btn"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  {duplicateWarning ? 'Confirm Save' : 'Save Holiday Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE REPORT PREVIEW */}
      {/* ========================================================================= */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>OFC360 Enterprise Holiday Report ({reportType})</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
              <div className="border-b pb-2 font-bold flex justify-between">
                <span>OFFICE LOCATION: ALL ENTERPRISE HUBS</span>
                <span>CALENDAR YEAR: 2026</span>
              </div>

              {filteredList.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-800/50"
                >
                  <span className="font-bold">{h.date}</span>
                  <span className="truncate max-w-[200px]">{h.name}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {h.category}
                  </span>
                  <span>{h.location}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Generated by OFC360 People Operations Module
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: NOTIFICATIONS FEED */}
      {/* ========================================================================= */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 space-y-4 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Holiday Notifications</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {notificationsList.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
