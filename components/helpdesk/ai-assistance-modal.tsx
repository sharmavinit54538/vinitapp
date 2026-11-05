'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  Copy,
  Tag,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  X,
  MessageSquare,
} from 'lucide-react';

interface AiAssistanceModalProps {
  open: boolean;
  onClose: () => void;
  onApplyReplySuggestion?: (reply: string) => void;
  onSuccessToast: (msg: string) => void;
}

export function AiAssistanceModal({
  open,
  onClose,
  onApplyReplySuggestion,
  onSuccessToast,
}: AiAssistanceModalProps) {
  const [inputText, setInputText] = useState(
    'My section 80C mutual fund investment statement was rejected in the November payroll run. I re-uploaded the official stamped copy from AMC portal. Please re-validate so TDS is adjusted.'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    suggestedCategory: string;
    suggestedPriority: string;
    sentiment: string;
    summary: string;
    recommendedKb: string;
    routingAgent: string;
    replySuggestions: string[];
  } | null>({
    suggestedCategory: 'Payroll Support > Tax & TDS',
    suggestedPriority: 'High',
    sentiment: 'Neutral / Action-Oriented',
    summary: 'Employee is seeking re-validation of rejected Section 80C ELSS mutual fund tax proof for upcoming November payroll cycle.',
    recommendedKb: 'How to Submit and Verify Section 80C Tax Investment Proofs (KB-101)',
    routingAgent: 'Aarav Sharma (Lead HR Support Architect - Payroll & Tax)',
    replySuggestions: [
      'Hello Elena, thank you for reaching out. We have received your re-uploaded stamped AMC certificate and our compliance desk has verified PAN and registration details. The deduction adjustment will reflect in your Nov 28 payout.',
      'Hi Elena, your Section 80C stamped document is currently under review with our Finance Controller. We will notify you as soon as the revised Form 16 provisional estimate is generated.',
    ],
  });

  if (!open) return null;

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const lower = inputText.toLowerCase();
      let priority = 'Medium';
      let cat = 'HR Support > General';
      let sent = 'Neutral';

      if (lower.includes('tax') || lower.includes('tds') || lower.includes('salary') || lower.includes('payroll')) {
        cat = 'Payroll Support > Tax & TDS';
        priority = 'High';
      } else if (lower.includes('vpn') || lower.includes('sso') || lower.includes('urgent') || lower.includes('locked')) {
        cat = 'IT Support > Account Access';
        priority = 'Critical';
        sent = 'Urgent / Distressed';
      } else if (lower.includes('leave') || lower.includes('vacation')) {
        cat = 'Leave Support > Leave Balance';
      }

      setResult({
        suggestedCategory: cat,
        suggestedPriority: priority,
        sentiment: sent,
        summary: `Query processed. Focused on ${cat}. Recommend triage under ${priority} SLA window.`,
        recommendedKb: 'How to Submit and Verify Section 80C Tax Investment Proofs (KB-101)',
        routingAgent: 'Aarav Sharma (People Operations)',
        replySuggestions: [
          `Hello, thank you for contacting the Support Desk regarding your query. We have initiated review under ${priority} SLA guidelines.`,
          `Hi, we have acknowledged your submission and verified all associated profile documents.`,
        ],
      });
      onSuccessToast('AI insights generated for ticket query.');
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    if (onApplyReplySuggestion) {
      onApplyReplySuggestion(text);
    }
    onSuccessToast('Reply copied to clipboard and applied to composer!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                OFC360 AI Support Intelligence
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated triage, sentiment analysis &amp; draft generation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Ticket Query / Employee Message
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !inputText.trim()}
            className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{analyzing ? 'Analyzing Ticket...' : 'Analyze & Suggest Reply'}</span>
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* Classification & Sentiment Badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Category</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{result.suggestedCategory}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Priority</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{result.suggestedPriority}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Sentiment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{result.sentiment}</span>
              </div>
            </div>

            {/* Smart Summary */}
            <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 space-y-1">
              <span className="text-[11px] font-bold text-violet-900 dark:text-violet-300 block">
                Executive Synthesis
              </span>
              <p className="text-violet-950 dark:text-violet-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Recommended KB */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.recommendedKb}
                </span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold whitespace-nowrap">94% Match</span>
            </div>

            {/* AI Reply Suggestions */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Suggested HR Responses (1-Click Apply)
              </span>
              {result.replySuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 group transition-all"
                >
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    {suggestion}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(suggestion)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-violet-600 hover:bg-violet-50 shrink-0 cursor-pointer"
                    title="Copy and apply to reply composer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
