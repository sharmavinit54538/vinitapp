'use client';

import React, { useState } from 'react';
import { SlaRuleConfig, TicketPriority } from '@/lib/helpdesk-types';
import { Ofc360Role } from '@/lib/auth-schemas';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Save,
  CheckCircle2,
  Bell,
  ArrowRight,
} from 'lucide-react';

interface SlaManagementViewProps {
  slaRules: SlaRuleConfig[];
  canEdit: boolean;
  onUpdateRule: (rule: Partial<SlaRuleConfig> & { priority: string }) => Promise<void>;
  onSuccessToast: (msg: string) => void;
}

export function SlaManagementView({
  slaRules,
  canEdit,
  onUpdateRule,
  onSuccessToast,
}: SlaManagementViewProps) {
  const [selectedRule, setSelectedRule] = useState<SlaRuleConfig>(slaRules[0]);
  const [firstResponseHours, setFirstResponseHours] = useState(selectedRule.firstResponseTargetHours);
  const [resolutionHours, setResolutionHours] = useState(selectedRule.resolutionTargetHours);
  const [autoEscalateHours, setAutoEscalateHours] = useState(selectedRule.autoEscalateAfterHours);

  const handleSelectPriority = (priority: TicketPriority) => {
    const found = slaRules.find((r) => r.priority === priority);
    if (found) {
      setSelectedRule(found);
      setFirstResponseHours(found.firstResponseTargetHours);
      setResolutionHours(found.resolutionTargetHours);
      setAutoEscalateHours(found.autoEscalateAfterHours);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      onSuccessToast('Permission denied: Only HR Admin can modify SLA thresholds.');
      return;
    }
    await onUpdateRule({
      priority: selectedRule.priority,
      firstResponseTargetHours: Number(firstResponseHours),
      resolutionTargetHours: Number(resolutionHours),
      autoEscalateAfterHours: Number(autoEscalateHours),
    });
    onSuccessToast(`SLA policies for ${selectedRule.priority} tier updated.`);
  };

  return (
    <div className="space-y-4" data-testid="sla-management-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Enterprise Service Level Agreement (SLA) Engine
          </h2>
          <p className="text-xs text-slate-500">
            Configure response windows, holiday calendar buffers &amp; automated breach escalation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Holiday Sync Active (2026 Calendar)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: SLA Priority Rules Matrix (col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          {slaRules.map((rule) => {
            const isSelected = selectedRule.priority === rule.priority;
            return (
              <div
                key={rule.id}
                onClick={() => handleSelectPriority(rule.priority)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs space-y-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        rule.priority === 'Critical'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          : rule.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {rule.priority} Priority Tier
                    </span>
                    {rule.businessHoursOnly ? (
                      <span className="text-[11px] text-slate-500 font-mono">09:00 - 18:00 Business Hours</span>
                    ) : (
                      <span className="text-[11px] text-rose-600 font-mono font-bold">24x7 365 Days SLA</span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    Escalate &rarr; {rule.escalateToRole}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">First Response</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {rule.firstResponseTargetHours} Hours
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">Resolution Target</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {rule.resolutionTargetHours} Hours
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">Auto-Escalation</span>
                    <span className="font-mono font-bold text-amber-600 text-sm">
                      After {rule.autoEscalateAfterHours}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Configure Selected Tier Parameters (col-span-5) */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Edit Thresholds for {selectedRule.priority} Tier
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  First Response Target (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={96}
                  value={firstResponseHours}
                  onChange={(e) => setFirstResponseHours(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Resolution Window (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={resolutionHours}
                  onChange={(e) => setResolutionHours(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Trigger Escalation Level 1 (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={autoEscalateHours}
                  onChange={(e) => setAutoEscalateHours(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-500">Business Hours Engine</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Clock pauses outside 09:00 - 18:00 and on national corporate holidays automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={!canEdit}
                className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save SLA Thresholds</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
