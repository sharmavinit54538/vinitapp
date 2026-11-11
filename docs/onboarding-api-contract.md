# OFC360 HRMS — Onboarding (Pre-boarding to Probation Confirmation) REST API Contract

**Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` (defaults to `/api/v1/onboarding`).
**Authentication**: `Authorization: Bearer <access_token>` header attached automatically by `src/services/onboarding/client.ts` from `authClient` (`lib/auth-api.ts`).
**Automation Policy**: All workflow triggers, task assignments, SLA reminders/escalations, document OCR extraction, IT/SSO account provisioning, payroll readiness validation, and probation milestone tracking execute strictly on the backend. The frontend validates inputs, triggers API actions, polls/streams live status, and renders server-returned records.
**Error Format**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | FORBIDDEN | NOT_FOUND | CONFLICT | SLA_BREACH | UPSTREAM_ERROR",
    "message": "Human-readable error description",
    "details": {}
  }
}
```
**Standard Error Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`, `500 Internal Server Error`, `503 Service Unavailable`.

---

## Role-Based Access Control (RBAC) Roles
- `super_admin`: Full access across all 24 modules, system settings, automation rules, PII reveal, and audit logs.
- `hr_admin`: Full operational access across joiners, templates, tasks, documents, data collection, handoffs, policies, IT/payroll handoffs, induction, training, buddy, probation, surveys, communications, approvals, reports, settings, audit logs, and manager portal.
- `hr_executive`: Operational access to joiners, tasks, documents, joining forms, handoffs, policies, induction, training, buddy, day-1 kit, probation, surveys, communications, and reports.
- `reporting_manager`: Access to Dashboard, Joiner Management, Task Management, Buddy Assignment, Probation Tracking, Approvals, Manager Portal, and Notifications.
- `it_admin`: Access to Task Management, IT/Asset & Access Provisioning, and Notifications.
- `admin_facilities`: Access to Task Management, IT/Asset & Access Provisioning (seating/ID cards), Day-1 Welcome Kit, and Notifications.
- `finance_payroll`: Access to Task Management, Document Verification (bank/PAN/UAN), Payroll & Statutory Setup Handoff, Approvals, and Notifications.
- `buddy_mentor`: Access to Task Management, Buddy / Mentor Assignment, Day-1 Experience, and Notifications.
- `new_joiner`: Restricted strictly to Module 24 (`New Joiner Portal`), Module 5 (`Document Collection`), Module 6 (`Employee Data Collection`), Module 8 (`Policy E-Sign`), Module 11 (`Induction`), Module 12 (`Training`), Module 16 (`Pulse Surveys`), and Module 22 (`Notifications`).

---

## 1. Onboarding Dashboard (`dashboard`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/summary` | `?from=&to=&departmentId=&location=&legalEntityId=&managerId=&hrOwnerId=` | `OnboardingDashboardResponse` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |

---

## 2. Joiner Management (`joiners`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/joiners` | `?page=&pageSize=&stage=&search=&department=&location=&sortBy=` | `PaginatedResponse<JoinerRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `GET` | `/joiners/:id` | None | `Joiner360ProfileResponse` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `POST` | `/joiners/:id/change-date` | `{ requestedJoiningDate: string, reason: string }` | `JoinerRecord` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `POST` | `/joiners/:id/no-show` | `{ reason: string, withdrawOffer: boolean }` | `JoinerRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `GET` | `/joiners/export` | `?stage=&format=csv` | `Blob` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 3. Onboarding Workflows & Templates (`workflows`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/workflow-templates` | `?department=&employmentType=&status=` | `PaginatedResponse<OnboardingWorkflowTemplate>` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/workflow-templates` | `CreateWorkflowTemplatePayload` | `OnboardingWorkflowTemplate` | `super_admin`, `hr_admin` | Required from backend |
| `POST` | `/workflow-templates/:id/clone` | `{}` | `OnboardingWorkflowTemplate` | `super_admin`, `hr_admin` | Required from backend |
| `POST` | `/workflow-templates/:id/toggle` | `{ active: boolean }` | `OnboardingWorkflowTemplate` | `super_admin`, `hr_admin` | Required from backend |

---

## 4. Task Management & Assignment (`tasks`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | `?joinerId=&ownerRole=&status=&overdueOnly=&page=&pageSize=` | `PaginatedResponse<OnboardingTaskRecord>` | All authenticated roles | Required from backend |
| `POST` | `/tasks` | `CreateOnboardingTaskPayload` | `OnboardingTaskRecord` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `POST` | `/tasks/bulk-action` | `{ taskIds: string[], action: 'complete' \| 'reassign' \| 'remind', targetOwner?: string }` | `{ updatedCount: number }` | All authenticated roles | Required from backend |

---

## 5. Document Collection & Verification (`documents`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/documents` | `?joinerId=&status=&category=&page=&pageSize=` | `PaginatedResponse<JoinerDocumentRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `finance_payroll`, `new_joiner` | Required from backend |
| `POST` | `/documents/upload` | `FormData (file, joinerId, documentType)` | `JoinerDocumentRecord` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `POST` | `/documents/:id/verify` | `{ decision: 'Approved' \| 'Rejected', remarks: string }` | `JoinerDocumentRecord` | `super_admin`, `hr_admin`, `hr_executive`, `finance_payroll` | Required from backend |
| `POST` | `/documents/:id/reveal-sensitive` | `{}` | `{ documentId: string; unmaskedNumber: string }` | `super_admin`, `hr_admin`, `finance_payroll` | Required from backend |

---

## 6. Employee Data Collection (`joining-forms`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/joining-forms` | `?joinerId=&status=` | `PaginatedResponse<JoiningFormSubmissionRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `PUT` | `/joining-forms/:joinerId` | `SaveJoiningFormPayload` | `JoiningFormSubmissionRecord` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `POST` | `/joining-forms/:joinerId/review` | `{ action: 'LockApproved' \| 'RequestCorrection', comments: string }` | `JoiningFormSubmissionRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 7. Offer-to-Joining Handoff (`offer-handoff`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/offer-handoffs` | `?status=&page=&pageSize=` | `PaginatedResponse<OfferToJoiningHandoffRecord>` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/offer-handoffs/:id/generate-emp-id` | `{}` | `OfferToJoiningHandoffRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 8. Policy Acknowledgement & E-Sign (`policies`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/policies/assignments` | `?joinerId=&status=` | `PaginatedResponse<PolicyAssignmentRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `POST` | `/policies/assign-pack` | `{ joinerId: string, policyPackCode: string }` | `PolicyAssignmentRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/policies/:id/esign` | `{ signatureText: string }` | `PolicyAssignmentRecord` | `new_joiner`, `super_admin`, `hr_admin` | Required from backend |
| `GET` | `/policies/:id/signed-pdf` | None | `Blob` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |

---

## 9. IT, Asset & Access Provisioning (`it-assets`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/provisioning/requests` | `?joinerId=&status=&category=` | `PaginatedResponse<ProvisioningRequestRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `it_admin`, `admin_facilities` | Required from backend |
| `POST` | `/provisioning/requests` | `CreateProvisioningRequestPayload` | `ProvisioningRequestRecord` | `super_admin`, `hr_admin`, `hr_executive`, `it_admin`, `admin_facilities` | Required from backend |
| `POST` | `/provisioning/requests/:id/fulfill` | `{ serialNumberOrAccount: string, handoverConfirmed: boolean }` | `ProvisioningRequestRecord` | `super_admin`, `it_admin`, `admin_facilities` | Required from backend |

---

## 10. Payroll & Statutory Setup Handoff (`payroll-handoff`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/payroll-handoffs` | `?readyOnly=&page=&pageSize=` | `PaginatedResponse<PayrollStatutoryHandoffRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `finance_payroll` | Required from backend |
| `POST` | `/payroll-handoffs/:id/sync-payroll` | `{}` | `PayrollStatutoryHandoffRecord` | `super_admin`, `hr_admin`, `finance_payroll` | Required from backend |

---

## 11. Orientation & Induction Scheduling (`induction`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/induction/sessions` | `?from=&to=&mode=` | `PaginatedResponse<InductionSessionRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `POST` | `/induction/sessions` | `CreateInductionSessionPayload` | `InductionSessionRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/induction/sessions/:id/attendance` | `{ joinerId: string, attended: boolean }` | `InductionSessionRecord` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 12. Training & Learning Assignment (`training`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/training/assignments` | `?joinerId=&status=` | `PaginatedResponse<JoinerTrainingAssignmentRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager`, `new_joiner` | Required from backend |
| `POST` | `/training/assign` | `{ joinerId: string, courseCode: string, dueDate: string }` | `JoinerTrainingAssignmentRecord` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |

---

## 13. Buddy / Mentor Assignment (`buddy`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/buddies/assignments` | `?joinerId=&buddyId=` | `PaginatedResponse<BuddyAssignmentRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager`, `buddy_mentor` | Required from backend |
| `POST` | `/buddies/assign` | `{ joinerId: string, buddyEmployeeCode: string, checkInCadenceDays: number }` | `BuddyAssignmentRecord` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |

---

## 14. Day-1 Experience & Welcome Kit (`day-one`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/day-one/kits` | `?status=` | `PaginatedResponse<DayOneExperienceRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `admin_facilities`, `buddy_mentor` | Required from backend |
| `POST` | `/day-one/kits/:id/confirm-joining` | `{ kitDispatched: boolean, dayOneAttended: boolean }` | `DayOneExperienceRecord` | `super_admin`, `hr_admin`, `hr_executive`, `admin_facilities` | Required from backend |

---

## 15. Probation Tracking & Confirmation (`probation`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/probation/cases` | `?status=&department=` | `PaginatedResponse<ProbationCaseRecord>` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `POST` | `/probation/cases/:id/evaluate` | `{ milestoneDay: 30 \| 60 \| 90, ratingOutOf5: number, decision: 'Confirm' \| 'Extend' \| 'Terminate', extensionDays?: number, comments: string }` | `ProbationCaseRecord` | `super_admin`, `hr_admin`, `reporting_manager` | Required from backend |
| `GET` | `/probation/cases/:id/letter-pdf` | None | `Blob` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |

---

## 16. Feedback & Pulse Surveys (`surveys`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/surveys/responses` | `?milestone=Day1\|Week1\|Day30\|Day90` | `OnboardingSurveyWorkspaceResponse` | `super_admin`, `hr_admin`, `hr_executive`, `new_joiner` | Required from backend |
| `POST` | `/surveys/submit` | `{ milestone: 'Day1' \| 'Week1' \| 'Day30' \| 'Day90', eNpsScore: number, feedbackText: string, anonymous: boolean }` | `{ recorded: boolean }` | `new_joiner`, `super_admin`, `hr_admin` | Required from backend |

---

## 17. Communication Center (`communications`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/communications/logs` | `?channel=&stage=` | `PaginatedResponse<OnboardingCommunicationLog>` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/communications/send` | `{ joinerIds: string[], channel: 'Email' \| 'SMS' \| 'WhatsApp', templateCode: string }` | `{ queuedCount: number }` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 18. Approvals Workflow (`approvals`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/approvals` | `?type=&status=` | `PaginatedResponse<OnboardingApprovalItem>` | `super_admin`, `hr_admin`, `reporting_manager`, `finance_payroll` | Required from backend |
| `POST` | `/approvals/decide` | `{ approvalIds: string[], decision: 'Approved' \| 'Rejected' \| 'Delegated', comments: string }` | `{ processedCount: number }` | `super_admin`, `hr_admin`, `reporting_manager`, `finance_payroll` | Required from backend |

---

## 19. Reports & Analytics (`reports`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/:reportKey/run` | `?from=&to=&departmentId=` | `OnboardingReportRunResponse` | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager` | Required from backend |
| `GET` | `/reports/:reportKey/export` | `?format=csv\|xlsx\|pdf` | `Blob` | `super_admin`, `hr_admin`, `hr_executive` | Required from backend |

---

## 20. Settings & Automation Rules (`settings`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/settings` | None | `OnboardingSettingsResponse` | `super_admin`, `hr_admin` | Required from backend |
| `PUT` | `/settings/automation-rules/:ruleId` | `{ enabled: boolean }` | `OnboardingAutomationRule` | `super_admin`, `hr_admin` | Required from backend |

---

## 21. Audit Logs (`audit-logs`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/audit-logs` | `?actor=&action=&page=&pageSize=` | `PaginatedResponse<OnboardingAuditLogRecord>` | `super_admin`, `hr_admin` | Required from backend |
| `GET` | `/audit-logs/export` | `?format=csv` | `Blob` | `super_admin`, `hr_admin` | Required from backend |

---

## 22. Notifications (`notifications`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | `?unreadOnly=` | `PaginatedResponse<OnboardingNotificationRecord>` | All roles | Required from backend |
| `POST` | `/notifications/mark-read` | `{ notificationIds: string[] }` | `{ markedCount: number }` | All roles | Required from backend |

---

## 23. Manager Portal (`manager-portal`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/manager-portal/workspace` | None | `OnboardingManagerPortalResponse` | `super_admin`, `hr_admin`, `reporting_manager` | Required from backend |

---

## 24. New Joiner Portal (`joiner-portal`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/joiner-portal/me` | None | `NewJoinerPortalWorkspaceResponse` | `new_joiner`, `super_admin`, `hr_admin`, `hr_executive` | Required from backend |
| `POST` | `/joiner-portal/helpdesk-query` | `{ subject: string, message: string, category: 'IT' \| 'HR' \| 'Payroll' \| 'Facilities' }` | `{ ticketId: string }` | `new_joiner`, `super_admin`, `hr_admin` | Required from backend |
