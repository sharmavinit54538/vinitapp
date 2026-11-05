import React from 'react';
import { PayrollAnalyticsDashboard } from '@/components/payroll-analytics/payroll-analytics-dashboard';

export default function PayrollAnalyticsPage() {
  return <PayrollAnalyticsDashboard isEmbedded={false} initialRole="hr_admin" />;
}
