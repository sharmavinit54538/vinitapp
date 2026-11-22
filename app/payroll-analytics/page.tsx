import React from 'react';
import { PayrollAnalyticsDashboard } from '@/components/payroll-analytics/payroll-analytics-dashboard';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';

export default function PayrollAnalyticsPage() {
  return (
    <RoleRouteGuard routePath="/payroll-analytics">
      <PayrollAnalyticsDashboard isEmbedded={false} initialRole="hr_admin" />
    </RoleRouteGuard>
  );
}
