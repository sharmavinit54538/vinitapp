'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  SlidersHorizontal,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import {
  ApprovalItem,
  ApprovalCategory,
  ApprovalStatus,
  filterApprovals,
} from '@/lib/hr-dashboard-logic';
import { useDecideApprovalMutation } from '@/lib/store/hr-api';
import { resolveDataSectionState } from '@/src/lib/linkedin-ui-helpers';
import {
  LinkedInEmptyState,
  LinkedInErrorState,
  LinkedInLoadingRows,
  LinkedInSection,
  LinkedInTopTabs,
} from '@/src/components/linkedin/LinkedInPrimitives';

interface ApprovalsScreenProps {
  approvals: ApprovalItem[];
  isDark: boolean;
  canManage: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSuccessToast: (msg: string) => void;
}

const CATEGORIES: (ApprovalCategory | 'All')[] = [
  'All',
  'Leave Requests',
  'Attendance Regularizations',
  'Expense Claims',
];

const STATUS_TABS: { id: ApprovalStatus | 'All'; label: string }[] = [
  { id: 'Pending', label: 'Pending' },
  { id: 'Approved', label: 'Approved' },
  { id: 'Rejected', label: 'Rejected' },
  { id: 'All', label: 'All' },
];

export function ApprovalsScreen({
  approvals,
  canManage,
  isLoading = false,
  isError = false,
  onRetry,
  onSuccessToast,
}: ApprovalsScreenProps) {
  const [decideApproval, { isLoading: isDeciding }] = useDecideApprovalMutation();

  const [category, setCategory] = useState<ApprovalCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'All'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const filtered = filterApprovals(approvals, category, statusFilter, searchQuery);
  const sectionState = resolveDataSectionState({
    isLoading,
    isError,
    itemCount: filtered.length,
  });

  const handleDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await decideApproval({ id, status }).unwrap();
      onSuccessToast(`Request ${status.toLowerCase()}`);
    } catch {
      onSuccessToast('Unable to update approval status');
    }
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <LinkedInSection>
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em] truncate">
              {category === 'All' ? 'Approvals' : category}
            </h1>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Review leave, attendance, and expense requests
            </p>
          </div>

          <button
            type="button"
            aria-label="Filter approvals by category"
            onClick={() => setIsCategoryMenuOpen(true)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#171717] hover:bg-[#F3F2EF] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#404040]" strokeWidth={1.9} />
            <span>{category === 'All' ? 'Category' : category}</span>
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-3 h-4 w-4 text-[#666666]"
              strokeWidth={1.85}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee, ID, or reason"
              aria-label="Search approval requests"
              className="h-10 w-full rounded-md border border-[#E5E7EB] bg-[#FAFAFA] pl-9 pr-3 text-[13px] text-[#171717] placeholder:text-[#666666] focus:border-[#0A66C2] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <LinkedInTopTabs
          tabs={STATUS_TABS}
          activeTab={statusFilter}
          onSelect={setStatusFilter}
          ariaLabel="Approval status filter"
        />

        {sectionState === 'loading' ? (
          <LinkedInLoadingRows rows={3} />
        ) : sectionState === 'error' ? (
          <LinkedInErrorState
            message="Could not fetch approval requests from the server."
            onRetry={onRetry}
          />
        ) : sectionState === 'empty' ? (
          <LinkedInEmptyState
            title={
              statusFilter === 'Pending'
                ? "You're all caught up"
                : `No ${statusFilter === 'All' ? '' : statusFilter.toLowerCase() + ' '}requests`
            }
            subtitle={
              statusFilter === 'Pending'
                ? 'No pending approvals'
                : 'No approval items match the current filter.'
            }
            variant={statusFilter === 'Pending' ? 'success' : 'neutral'}
          />
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="text-[14px] font-semibold text-[#171717]">
                      {item.employeeName}
                    </p>
                    <span className="text-[12px] text-[#666666] tabular-nums">
                      {item.employeeId}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        item.status === 'Approved'
                          ? 'text-[#15803D]'
                          : item.status === 'Rejected'
                            ? 'text-[#B91C1C]'
                            : 'text-[#B45309]'
                      }`}
                    >
                      · {item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                    {item.category} · {item.requestType} · {item.durationOrAmount}
                  </p>
                  <p className="mt-1 text-[13px] text-[#404040]">{item.reason}</p>
                </div>

                {canManage && item.status === 'Pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isDeciding}
                      onClick={() => handleDecision(item.id, 'Approved')}
                      aria-label={`Approve request for ${item.employeeName}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#0A66C2] px-3.5 text-[12px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isDeciding}
                      onClick={() => handleDecision(item.id, 'Rejected')}
                      aria-label={`Reject request for ${item.employeeName}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3.5 text-[12px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </LinkedInSection>

      {/* Category Filter Modal */}
      {isCategoryMenuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter approval category"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setIsCategoryMenuOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
              <h2 className="text-[15px] font-semibold text-[#171717]">
                Filter by category
              </h2>
              <button
                type="button"
                aria-label="Close category filter"
                onClick={() => setIsCategoryMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-[14px] hover:bg-[#F3F2EF] transition-colors cursor-pointer ${
                      active ? 'font-semibold text-[#0A66C2]' : 'font-normal text-[#171717]'
                    }`}
                  >
                    <span>{cat === 'All' ? 'All request categories' : cat}</span>
                    {active ? <CheckCircle2 className="h-4 w-4 text-[#0A66C2]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
