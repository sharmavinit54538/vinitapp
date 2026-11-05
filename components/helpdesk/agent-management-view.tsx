'use client';

import React, { useState } from 'react';
import { SupportAgent } from '@/lib/helpdesk-types';
import {
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  TrendingUp,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AgentManagementViewProps {
  agents: SupportAgent[];
  canEdit: boolean;
  onSuccessToast: (msg: string) => void;
}

export function AgentManagementView({
  agents: initialAgents,
  canEdit,
  onSuccessToast,
}: AgentManagementViewProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [autoAssignment, setAutoAssignment] = useState(true);

  const toggleAvailability = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const nextStatus =
            a.availabilityStatus === 'Available'
              ? 'Busy'
              : a.availabilityStatus === 'Busy'
              ? 'Offline'
              : 'Available';
          onSuccessToast(`Updated ${a.name} status to ${nextStatus}.`);
          return { ...a, availabilityStatus: nextStatus };
        }
        return a;
      })
    );
  };

  return (
    <div className="space-y-4" data-testid="agent-management-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Support Agent Pool &amp; Capacity Roster
          </h2>
          <p className="text-xs text-slate-500">
            Monitor real-time agent workloads, response SLAs &amp; skill allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAutoAssignment(!autoAssignment);
              onSuccessToast(
                !autoAssignment
                  ? 'AI Round-Robin Auto-Assignment Activated.'
                  : 'Manual Ticket Triage Mode Enabled.'
              );
            }}
            className={`min-h-[36px] px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              autoAssignment
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{autoAssignment ? 'Auto-Assignment: ON' : 'Manual Triage'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-500">{agent.role} · {agent.department}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleAvailability(agent.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  agent.availabilityStatus === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                    : agent.availabilityStatus === 'Busy'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title="Tap to toggle availability"
              >
                ● {agent.availabilityStatus}
              </button>
            </div>

            {/* Workload Progress Bar */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Current Workload Capacity</span>
                <span className="font-mono text-slate-900 dark:text-white">{agent.currentWorkloadScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    agent.currentWorkloadScore > 75
                      ? 'bg-rose-500'
                      : agent.currentWorkloadScore > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${agent.currentWorkloadScore}%` }}
                />
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Active</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {agent.assignedTicketsCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Resolved</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {agent.resolvedTicketsCount}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Avg Response</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {agent.avgResponseTimeMinutes}m
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Avg Res.</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {agent.avgResolutionTimeHours}h
                </span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {agent.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
