'use client';

import React, { useState } from 'react';
import { HelpDeskState } from '@/lib/helpdesk-types';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HelpDeskReportsViewProps {
  state: HelpDeskState;
  onSuccessToast: (msg: string) => void;
}

export function HelpDeskReportsView({
  state,
  onSuccessToast,
}: HelpDeskReportsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<
    'volume' | 'departments' | 'categories' | 'agents' | 'sla'
  >('volume');
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const { tickets, agents, kpis } = state;

  const handleExport = (format: 'CSV' | 'JSON') => {
    const dataStr =
      format === 'CSV'
        ? [
            'TicketNumber,Subject,Employee,Department,Category,Priority,Status,SlaStatus,Created',
            ...tickets.map(
              (t) =>
                `"${t.ticketNumber}","${t.subject.replace(/"/g, '""')}","${t.employeeName}","${t.department}","${t.category}","${t.priority}","${t.status}","${t.slaStatus}","${t.createdDate}"`
            ),
          ].join('\n')
        : JSON.stringify(tickets, null, 2);

    const blob = new Blob([dataStr], {
      type: format === 'CSV' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OFC360_HelpDesk_${activeReportTab}_${Date.now()}.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
    onSuccessToast(`Generated and exported ${format} report.`);
  };

  return (
    <div className="space-y-4" data-testid="helpdesk-reports-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Enterprise Help Desk Analytics &amp; Statutory MIS Reports
          </h2>
          <p className="text-xs text-slate-500">
            Export verified service audit logs, compliance ratios &amp; resolution breakdowns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('CSV')}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('JSON')}
            className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export JSON Audit</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        {[
          { id: 'volume', label: 'Ticket Volume Trends' },
          { id: 'departments', label: 'Department MIS' },
          { id: 'categories', label: 'Category & Subcategory' },
          { id: 'agents', label: 'Agent Productivity' },
          { id: 'sla', label: 'SLA Compliance & CSAT' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Report Table / Visualizer */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        {activeReportTab === 'volume' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Inflow vs Resolution Ratio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <span className="text-xs text-slate-400">Total Logged Tickets</span>
                <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {kpis.totalTickets}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <span className="text-xs text-slate-400">Resolved Rate</span>
                <p className="text-2xl font-black font-mono text-emerald-600 mt-1">
                  92.8%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                <span className="text-xs text-slate-400">First Contact Resolution</span>
                <p className="text-2xl font-black font-mono text-indigo-600 mt-1">
                  84.5%
                </p>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'departments' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department-wise Ticket Inflow &amp; SLA Performance
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { dept: 'Engineering', count: 4, sla: '94.2%', avgRes: '14.2h' },
                { dept: 'Product & Design', count: 2, sla: '96.0%', avgRes: '12.0h' },
                { dept: 'Enterprise Sales', count: 1, sla: '98.5%', avgRes: '16.5h' },
                { dept: 'Finance & Legal', count: 1, sla: '100%', avgRes: '8.0h' },
              ].map((d) => (
                <div key={d.dept} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{d.dept}</span>
                    <p className="text-[11px] text-slate-400">{d.count} Tickets Logged</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-600">{d.sla} SLA</span>
                    <p className="text-[11px] text-slate-400">Avg: {d.avgRes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReportTab === 'agents' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Support Agent Productivity &amp; Scorecard
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {agents.map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{a.name}</span>
                    <p className="text-[11px] text-slate-400">{a.role} · {a.department}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {a.resolvedTicketsCount} Resolved
                    </span>
                    <p className="text-[11px] text-indigo-600">Avg {a.avgResponseTimeMinutes}m First Resp</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReportTab === 'categories' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category Distribution Breakdown
            </h3>
            <div className="space-y-2 text-xs">
              {['Payroll Support', 'Attendance Support', 'IT Support', 'Leave Support', 'HR Support'].map(
                (c) => (
                  <div key={c} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c}</span>
                    <span className="font-mono text-indigo-600 font-bold">Active SLA Tier Managed</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeReportTab === 'sla' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SLA Compliance &amp; CSAT Index
            </h3>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Overall SLA Adherence: 96.2%</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Total breaches under tolerance index: 1 out of 8 current queue
                </p>
              </div>
              <span className="text-2xl font-black font-mono">4.8 / 5.0 ★</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
