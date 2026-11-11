# Employee Dashboard Module — Frontend REST & Real-Time API Contract

**Base URL**: `${NEXT_PUBLIC_API_BASE_URL}/api/v1/employee-dashboard` (Existing module endpoints under `/api/v1/hr/*`, `/api/v1/attendance-analytics/*`, `/api/v1/onboarding/*`, `/api/v1/assets/*`, `/api/v1/holidays/*` are reused or proxied via the unified Employee Dashboard gateway).
**Authentication**: `Authorization: Bearer <access_token>` (via `authClient.getAccessToken()` in `lib/auth-api.ts`).
**Scope Invariant**: Strictly scoped to the authenticated employee (`req.user.id` from JWT). **No endpoint accepts an `employeeId` query or URL parameter.** Any `employeeId` query parameter in the browser URL is rejected/stripped by the frontend guard.

---

## Standard Response & Error Envelopes

All responses include an ISO-8601 `asOf` server timestamp and `serverTimeIso` for clock-offset synchronization:

```json
{
  "asOf": "2026-11-09T14:30:00Z",
  "serverTimeIso": "2026-11-09T14:30:00.120Z",
  "data": { ... }
}
```

Standard error codes:
- `401 UNAUTHORIZED`: Missing or expired JWT token.
- `403 FORBIDDEN`: Role or module permission denied (widget hides gracefully).
- `404 NOT_APPLICABLE`: Conditional widget not applicable to employee (e.g., Travel, Probation, Exit).
- `409 CONFLICT`: Duplicate punch submission, already acknowledged policy, or invalid state transition.
- `422 GEO_FENCE_VIOLATION` / `DEVICE_NOT_ALLOWED`: Punch rejected by location or device policy.

---

## 0. Dashboard Bootstrap & Aggregation Endpoint

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/bootstrap` | — | `EmployeeDashboardBootstrapResponse` | `employee:self` | Required from backend |

---

## 1. Header, Profile Summary & Profile Completion

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/profile-summary` | — | `ProfileSummaryResponse` | `employee:self` | Existing (`/api/v1/auth/me` + profile completion extension) |

---

## 2. Today Widget (Punch In / Out, Geo-fence, Selfie & Regularization)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/today` | — | `TodayStatusResponse` | `attendance:self` | Existing (`/api/v1/hr/attendance`) |
| `POST` | `/api/v1/employee-dashboard/today/punch` | `PunchActionPayload` (`action`, `workMode`, `latitude?`, `longitude?`, `selfieDataUrl?`, `manualReason?`) | `PunchActionResponse` | `attendance:punch` | Existing (`/api/v1/hr/attendance/face-checkin`) |
| `POST` | `/api/v1/employee-dashboard/today/break` | `{ action: 'start' \| 'end' }` | `TodayStatusResponse` | `attendance:punch` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/today/regularize` | `RegularizationSubmitPayload` | `{ requestId: string; status: string; message: string }` | `attendance:regularize` | Required from backend |

---

## 3. Quick Actions (Permission-Driven & Pinnable)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/quick-actions` | — | `QuickActionsResponse` | `employee:self` | Required from backend |
| `PATCH` | `/api/v1/employee-dashboard/quick-actions/pin` | `{ actionId: string; pinned: boolean }` | `QuickActionsResponse` | `employee:self` | Required from backend |

---

## 4. My Attendance Summary (Monthly Heatmap & Stats)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/attendance-summary` | `?month=YYYY-MM` | `MyAttendanceSummaryResponse` | `attendance:self` | Existing (`/api/v1/attendance-analytics/employee-view`) |

---

## 5. My Leave (Balances, Requests, Team Leave & Holidays)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/leaves` | — | `MyLeaveWidgetResponse` | `leave:self` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/leaves/apply` | `ApplyLeavePayload` | `{ requestId: string; status: string; message: string }` | `leave:apply` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/leaves/:requestId/withdraw` | `{ reason: string }` | `{ requestId: string; status: string; message: string }` | `leave:withdraw` | Required from backend |

---

## 6. My Pay Snapshot (Masked Net Pay, Audited Reveal & PDF Blob)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/pay-snapshot` | — | `MyPaySnapshotResponse` (netPay omitted/masked) | `payroll:self` | Existing (`/api/v1/hr/payroll`) |
| `POST` | `/api/v1/employee-dashboard/pay-snapshot/reveal` | `{ payslipId: string }` | `PayRevealAuditedResponse` (`netPayFormatted`, `currency`, `auditId`, `expiresInSeconds`) | `payroll:reveal_net_pay` | Required from backend |
| `GET` | `/api/v1/employee-dashboard/pay-snapshot/:payslipId/download` | — | `application/pdf` Blob | `payroll:download_payslip` | Required from backend |

---

## 7. My Tasks & Pending Actions

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/tasks` | `?category=` | `MyTasksResponse` | `employee:self` | Existing (`/api/v1/onboarding/tasks`) |
| `POST` | `/api/v1/employee-dashboard/tasks/:taskId/complete` | `{ notes?: string }` | `{ taskId: string; completedAt: string }` | `employee:self` | Required from backend |

---

## 8. My Performance (OKRs, Review Cycle, 1:1s & Badges)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/performance` | — | `MyPerformanceResponse` | `performance:self` | Required from backend |
| `PATCH` | `/api/v1/employee-dashboard/performance/goals/:goalId` | `{ progressPct: number; statusNote?: string }` | `{ goalId: string; progressPct: number; status: string }` | `performance:update_goal` | Required from backend |

---

## 9. My Assets & Unified Requests Tracker

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/assets-requests` | `?requestType=&status=` | `MyAssetsAndRequestsResponse` | `employee:self` | Existing (`/api/v1/assets`) |
| `POST` | `/api/v1/employee-dashboard/assets/:assetId/acknowledge` | `{ conditionNote?: string }` | `{ assetId: string; acknowledgedAt: string }` | `assets:acknowledge` | Existing (`/api/v1/assets/:id/acknowledge`) |
| `POST` | `/api/v1/employee-dashboard/assets/:assetId/return-request` | `{ reason: string }` | `{ requestId: string; status: string }` | `assets:return` | Required from backend |

---

## 10. Learning (Courses, Certificates & LMS SSO)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/learning` | — | `MyLearningResponse` | `learning:self` | Required from backend |
| `GET` | `/api/v1/employee-dashboard/learning/certificates/:courseId/download` | — | `application/pdf` Blob | `learning:self` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/learning/sso-launch` | `{ courseId?: string }` | `{ ssoLaunchUrl: string }` | `learning:self` | Required from backend |

---

## 11. Company Feed (Announcements, Holidays, Celebrations & Events)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/company-feed` | — | `CompanyFeedResponse` | `employee:self` | Existing (`/api/v1/hr/announcements` & `/api/v1/hr/holidays`) |
| `POST` | `/api/v1/employee-dashboard/company-feed/announcements/:id/acknowledge` | — | `{ id: string; acknowledgedAt: string }` | `employee:self` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/company-feed/celebrations/:id/wish` | `{ reaction: string; message?: string }` | `{ id: string; totalWishes: number }` | `employee:self` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/company-feed/optional-holiday/:holidayId/book` | — | `{ bookingId: string; status: string }` | `leave:apply` | Existing (`/api/v1/holidays/optional/apply`) |

---

## 12. My Team & Org

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/team-org` | — | `MyTeamOrgResponse` | `employee:self` | Existing (`/api/v1/hr/workforce`) |

---

## 13. Travel (Conditional Widget)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/travel` | — | `MyTravelWidgetResponse` | `travel:self` | Required from backend |
| `GET` | `/api/v1/employee-dashboard/travel/trips/:tripId/tickets` | — | `application/pdf` Blob | `travel:self` | Required from backend |

---

## 14. Helpdesk (Tickets, FAQ Search & OFC Connect Chat)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/helpdesk` | `?q=` | `MyHelpdeskWidgetResponse` | `helpdesk:self` | Existing (`/api/v1/hr/helpdesk`) |
| `POST` | `/api/v1/employee-dashboard/helpdesk/tickets` | `RaiseHelpdeskTicketPayload` | `{ ticketId: string; status: string }` | `helpdesk:create` | Existing (`/api/v1/hr/helpdesk`) |

---

## 15. Probation / Exit (Conditional Widget)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/lifecycle` | — | `MyProbationExitResponse` | `employee:self` | Existing (`/api/v1/onboarding/probation`) |
| `POST` | `/api/v1/employee-dashboard/lifecycle/withdraw-resignation` | `{ reason: string }` | `{ status: string; message: string }` | `exit:withdraw` | Required from backend |

---

## 16. Manager Extras (Conditional — Manager Role Only)

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/manager-extras` | — | `ManagerExtrasWidgetResponse` | `manager:team_approvals` | Existing (`/api/v1/hr/approvals` & `/api/v1/attendance-analytics/manager-view`) |
| `POST` | `/api/v1/employee-dashboard/manager-extras/approvals/:id/decision` | `{ decision: 'Approved' \| 'Rejected'; comment?: string }` | `{ id: string; status: string }` | `manager:team_approvals` | Existing (`/api/v1/hr/approvals/action`) |

---

## 17. Widget Layout & Personalization

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/layout` | — | `DashboardLayoutConfigResponse` | `employee:self` | Required from backend |
| `PUT` | `/api/v1/employee-dashboard/layout` | `UpdateDashboardLayoutPayload` | `DashboardLayoutConfigResponse` | `employee:self` | Required from backend |
| `POST` | `/api/v1/employee-dashboard/layout/reset` | — | `DashboardLayoutConfigResponse` | `employee:self` | Required from backend |

---

## 18. Notifications & Global Search

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/notifications` | — | `EmployeeNotificationsResponse` | `employee:self` | Existing (`/api/v1/hr/notifications`) |
| `POST` | `/api/v1/employee-dashboard/notifications/mark-read` | `{ notificationId?: string; markAll?: boolean }` | `{ unreadCount: number }` | `employee:self` | Existing (`/api/v1/hr/notifications/read`) |
| `GET` | `/api/v1/employee-dashboard/search` | `?q=<query>` | `GlobalSearchResponse` | `employee:self` | Required from backend |

---

## 19. Real-Time Heartbeat & Live Sync

| Method | Path | Query / Body | Response Type | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/employee-dashboard/realtime-pulse` | `?since=<iso>` | `RealtimePulseResponse` | `employee:self` | Required from backend |
