'use client';

import React, { useState } from 'react';
import {
  Shield,
  Key,
  Database,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
  FileCode,
  Sliders,
  Settings,
  UserCheck
} from 'lucide-react';
import { PerformanceActivityLog } from '../../types/performanceGoals';

interface ItAdminPerformanceViewProps {
  activityLogs: PerformanceActivityLog[];
  onResetMockData: () => void;
  onToast: (msg: string) => void;
}

export function ItAdminPerformanceView({
  activityLogs,
  onResetMockData,
  onToast,
}: ItAdminPerformanceViewProps) {
  const [activeTab, setActiveTab] = useState<'rbac' | 'audit' | 'notifications' | 'settings'>('rbac');

  // RBAC matrix state
  const [permissions, setPermissions] = useState([
    { role: 'Employee', createGoal: true, editSelfAssessment: true, editPeerRating: true, viewCalibration: false, issuePip: false },
    { role: 'Manager', createGoal: true, editSelfAssessment: true, editPeerRating: true, viewCalibration: true, issuePip: true },
    { role: 'HR Admin', createGoal: true, editSelfAssessment: true, editPeerRating: true, viewCalibration: true, issuePip: true },
    { role: 'Executive', createGoal: false, editSelfAssessment: false, editPeerRating: false, viewCalibration: true, issuePip: false },
    { role: 'IT Admin', createGoal: false, editSelfAssessment: false, editPeerRating: false, viewCalibration: false, issuePip: false },
  ]);

  // Notifications toggles
  const [notifNudges, setNotifNudges] = useState(true);
  const [notifGoalOverdue, setNotifGoalOverdue] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [retentionDays, setRetentionDays] = useState('730');

  const togglePerm = (idx: number, key: 'createGoal' | 'editSelfAssessment' | 'editPeerRating' | 'viewCalibration' | 'issuePip') => {
    setPermissions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: !copy[idx][key] };
      return copy;
    });
    onToast('RBAC permission updated.');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* IT Admin Banner */}
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Security & Module System Admin</span>
            </div>
            <h2 className="text-lg font-bold mt-0.5 text-white">Performance Module Governance</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Access Control, Audit Trail & System Configuration
            </p>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Healthy
          </span>
        </div>

        {/* Quick System Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-center">
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
            <p className="text-[10px] text-slate-400">RBAC Roles</p>
            <p className="text-base font-bold text-white mt-0.5">5 Configured</p>
            <span className="text-[9px] text-sky-400 font-medium">Fine-Grained</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
            <p className="text-[10px] text-slate-400">Audit Logs</p>
            <p className="text-base font-bold text-white mt-0.5">{activityLogs.length}</p>
            <span className="text-[9px] text-emerald-400 font-medium">Immutable</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
            <p className="text-[10px] text-slate-400">Data Storage</p>
            <p className="text-base font-bold text-amber-400 mt-0.5">Local State</p>
            <span className="text-[9px] text-slate-400 font-medium">Offline Safe</span>
          </div>
        </div>
      </div>

      {/* Primary IT Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'rbac' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          RBAC Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'audit' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'notifications' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
            activeTab === 'settings' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          System Config
        </button>
      </div>

      {/* TAB 1: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Role-Based Access Control (RBAC)</h3>
              <p className="text-[10px] text-slate-500">Fine-grained permission gates for appraisals</p>
            </div>
            <button
              onClick={() => onToast('RBAC schema synced')}
              className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg"
            >
              Sync Rules
            </button>
          </div>

          <div className="space-y-3">
            {permissions.map((p, idx) => (
              <div key={p.role} className="p-3 border border-slate-100 rounded-xl bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    {p.role}
                  </span>
                  <span className="text-[10px] text-slate-400">System Role</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.createGoal}
                      onChange={() => togglePerm(idx, 'createGoal')}
                      className="rounded text-sky-600"
                    />
                    <span className="text-slate-600">Create Goals</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.editSelfAssessment}
                      onChange={() => togglePerm(idx, 'editSelfAssessment')}
                      className="rounded text-sky-600"
                    />
                    <span className="text-slate-600">Self Assessment</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.viewCalibration}
                      onChange={() => togglePerm(idx, 'viewCalibration')}
                      className="rounded text-sky-600"
                    />
                    <span className="text-slate-600">9-Box Calibration</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.issuePip}
                      onChange={() => togglePerm(idx, 'issuePip')}
                      className="rounded text-sky-600"
                    />
                    <span className="text-slate-600">Issue PIP</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Security Audit Trail</h3>
              <p className="text-[10px] text-slate-500">Immutable logs for appraisal integrity</p>
            </div>
            <button
              onClick={() => onToast('Exported audit_trail_log.json')}
              className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
            >
              Export JSON
            </button>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <p className="text-[9px] text-sky-600 font-medium">Actor: {log.userName} ({log.userRole})</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATION CONFIGURATION */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800">Notification Triggers & Alerts</h3>
          <p className="text-[10px] text-slate-500">Automated mobile push & email triggers</p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Review Cycle Evaluator Nudge</p>
                <p className="text-[10px] text-slate-400">Push reminder 3 days before deadline</p>
              </div>
              <input
                type="checkbox"
                checked={notifNudges}
                onChange={() => {
                  setNotifNudges(!notifNudges);
                  onToast('Evaluator nudge notification updated');
                }}
                className="w-4 h-4 rounded text-sky-600"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Goal Overdue & At-Risk Alert</p>
                <p className="text-[10px] text-slate-400">Alert employee & manager when progress drops</p>
              </div>
              <input
                type="checkbox"
                checked={notifGoalOverdue}
                onChange={() => {
                  setNotifGoalOverdue(!notifGoalOverdue);
                  onToast('Goal alert notification updated');
                }}
                className="w-4 h-4 rounded text-sky-600"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Weekly Executive Digest</p>
                <p className="text-[10px] text-slate-400">Summary email sent Monday 9:00 AM</p>
              </div>
              <input
                type="checkbox"
                checked={notifWeeklyDigest}
                onChange={() => {
                  setNotifWeeklyDigest(!notifWeeklyDigest);
                  onToast('Weekly digest notification updated');
                }}
                className="w-4 h-4 rounded text-sky-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM CONFIG */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Technical Module Settings</h3>
            <p className="text-[10px] text-slate-500">Frontend-only configuration & storage</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Data Retention (Days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Appraisal Rating Scale
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <option value="5">5-Point Likert Scale (Standard OFC360)</option>
                <option value="4">4-Point Scale (No Neutral)</option>
                <option value="10">10-Point Scale (Percentage)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onResetMockData();
                  onToast('Performance mock data restored to default seed.');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 hover:bg-rose-100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State to Factory Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
