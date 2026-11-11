'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  subtitle: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const canJump = isCompleted && Boolean(onStepClick);

          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onStepClick?.(step.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : isCompleted
                    ? 'cursor-pointer border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'cursor-default border-slate-200 bg-white opacity-75'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-bold ${
                      isCurrent
                        ? 'text-indigo-950'
                        : isCompleted
                        ? 'text-emerald-950'
                        : 'text-slate-700'
                    }`}
                  >
                    Step {step.id}: {step.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {step.subtitle}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
