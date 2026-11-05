'use client';

import React, { useState } from 'react';
import { HelpDeskState } from '@/lib/helpdesk-types';
import {
  Settings,
  Clock,
  Bell,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface HelpDeskSettingsViewProps {
  settings: HelpDeskState['settings'];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function HelpDeskSettingsView({
  settings: initialSettings,
  canEdit,
  onSuccessToast,
}: HelpDeskSettingsViewProps) {
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = () => {
    if (!canEdit) {
      onSuccessToast('Permission denied: Only HR Admin can modify global Help Desk settings.');
      return;
    }
    onSuccessToast('Help Desk system parameters and notification triggers saved.');
  };

  return (
    <div className="space-y-4" data-testid="helpdesk-settings-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Enterprise Help Desk Preferences &amp; Automation Triggers
        </h2>
        <p className="text-xs text-slate-500">
          Operational business hours, round-robin auto routing, SLA escalation &amp; notification channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Business Hours Configuration */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Business Hours &amp; Operating Windows
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Start Shift Time
                </label>
                <input
                  type="time"
                  value={settings.businessHoursStart}
                  onChange={(e) =>
                    setSettings({ ...settings, businessHoursStart: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  End Shift Time
                </label>
                <input
                  type="time"
                  value={settings.businessHoursEnd}
                  onChange={(e) =>
                    setSettings({ ...settings, businessHoursEnd: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                Active Support Weekdays
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <span
                    key={d}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      d !== 'Sat' && d !== 'Sun'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Automation & Notification Preferences */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automation &amp; Notification Rules
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Round-Robin Ticket Auto-Assignment
                </p>
                <p className="text-[11px] text-slate-500">
                  Evenly distribute new tickets based on agent availability &amp; skill set
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignmentEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, autoAssignmentEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Email Alerts on SLA Breach Approaching
                </p>
                <p className="text-[11px] text-slate-500">
                  Notify assigned agent and team lead 2 hours before breach threshold
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailAlertsEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailAlertsEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  OFC Connect / Slack Support Broadcasts
                </p>
                <p className="text-[11px] text-slate-500">
                  Stream ticket updates directly into internal department channels
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.slackIntegrationEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, slackIntegrationEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canEdit}
          className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save System Parameters</span>
        </button>
      </div>
    </div>
  );
}
