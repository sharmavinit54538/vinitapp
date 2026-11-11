# OFC360 HRMS — Recruitment (Talent Acquisition / ATS) REST API Contract

**Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` (defaults to `/api/v1/recruitment`).
**Authentication**: `Authorization: Bearer <access_token>` header attached automatically by `src/services/recruitment/client.ts` from the authenticated session context (`src/lib/auth-client.ts`).
**Computation & AI Policy**: All AI and automation capabilities (resume parsing, skill extraction, AI match scoring, knockout evaluation, slot optimization, video transcription/scoring, and offer compensation calculation) execute strictly on the backend. The frontend validates user inputs, triggers API actions, polls/streams live status, and renders server-returned records.
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
- `super_admin`: Full access across all 23 modules, system settings, automation rules, PII reveal, and audit logs.
- `hr_admin`: Full operational access across requisitions, postings, candidates, pipeline, offers, BGV, onboarding, agencies, reports, and settings.
- `recruiter`: Operational access to requisitions, job postings, sourcing, candidate database, AI screening, pipeline, assessments, interviews, offers, BGV, onboarding handoff, referrals, vendors, and communications.
- `hiring_manager`: Access to Hiring Manager Portal, Requisitions, Pipeline review, Interview scheduling, AI Video review, Scorecards, and Offer approvals.
- `interviewer`: Access to Interview Scheduling, AI Video Interview review, and Evaluation & Scorecards.
- `approver`: Access to Approvals Workflow, Requisitions, and Offer Management approvals.
- `candidate`: Restricted strictly to Module 4 (`Career Page & Candidate Portal`), Module 8 (`Assessments` candidate attempt), Module 10 (`AI Video Interview` recording), and Module 22 (`Notifications`).

---

## 1. Recruitment Dashboard (`dashboard`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/summary` | `?from=&to=&departmentId=&location=&recruiterId=&jobId=&legalEntityId=` | `RecruitmentDashboardResponse` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |

---

## 2. Manpower Planning & Job Requisitions (`requisitions`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/manpower-plans` | `?fiscalYear=&departmentId=` | `PaginatedResponse<ManpowerPlanRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |
| `GET` | `/requisitions` | `?page=&pageSize=&status=&departmentId=&location=&search=` | `PaginatedResponse<JobRequisitionRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |
| `POST` | `/requisitions` | `CreateRequisitionPayload` | `JobRequisitionRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/requisitions/generate-jd` | `{ title, department, skills, experienceMin, experienceMax, grade }` | `{ generatedJd: string; suggestedSkills: string[] }` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/requisitions/:id/clone` | `{}` | `JobRequisitionRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/requisitions/:id/status` | `{ status: 'Approved' \| 'OnHold' \| 'Closed' \| 'Reopened', reason: string }` | `JobRequisitionRecord` | `super_admin`, `hr_admin`, `approver` | Required from backend |

---

## 3. Job Posting & Multi-channel Sourcing (`job-postings`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/postings` | `?page=&pageSize=&status=&channel=&requisitionId=` | `PaginatedResponse<JobPostingRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/postings` | `CreateJobPostingPayload` | `JobPostingRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/postings/:id/publish` | `{ channels: SourcingChannelType[] }` | `JobPostingRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/postings/:id/channels/:channel/retry` | `{}` | `JobPostingRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/sourcing/bulk-resumes` | `FormData (files[], jobId, sourceChannel)` | `BulkResumeUploadResponse` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 4. Career Page & Candidate Portal (`career-portal`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/career-page/config` | None | `CareerPageConfigRecord` | All authenticated roles & `candidate` | Required from backend |
| `PUT` | `/career-page/config` | `Partial<CareerPageConfigRecord>` | `CareerPageConfigRecord` | `super_admin`, `hr_admin` | Required from backend |
| `GET` | `/career-page/jobs` | `?search=&department=&location=&employmentType=` | `PaginatedResponse<PublicJobListingRecord>` | All roles & `candidate` | Required from backend |
| `POST` | `/career-page/apply` | `CandidateApplicationPayload` | `CandidatePortalApplicationState` | All roles & `candidate` | Required from backend |
| `GET` | `/candidate-portal/me` | None | `CandidatePortalProfileResponse` | `candidate`, `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/candidate-portal/applications/:id/offer-decision` | `{ decision: 'Accepted' \| 'Declined', eSignSignature?: string, reason?: string }` | `CandidatePortalApplicationState` | `candidate`, `super_admin`, `hr_admin` | Required from backend |

---

## 5. Candidate Database / Talent Pool (`candidates`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/candidates` | `?page=&pageSize=&search=&skills=&experienceMin=&location=&source=&stage=&pool=&status=` | `PaginatedResponse<CandidateRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `GET` | `/candidates/:id` | None | `Candidate360ProfileResponse` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/candidates/:id/reveal-pii` | `{ fields: ('email' \| 'phone' \| 'currentCtc' \| 'govtId')[] }` | `CandidatePiiRevealResponse` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/candidates/:id/merge` | `{ duplicateCandidateId: string }` | `CandidateRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/candidates/:id/blacklist` | `{ blacklisted: boolean, reason: string }` | `CandidateRecord` | `super_admin`, `hr_admin` | Required from backend |
| `POST` | `/candidates/bulk-action` | `{ candidateIds: string[], action: 'tag' \| 'move_pool' \| 'email' \| 're_engage', payloadValue: string }` | `{ updatedCount: number }` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 6. Resume Parsing & AI Screening (`resume-screening`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/screening/results` | `?jobId=&page=&pageSize=&recommendation=&blindMode=` | `PaginatedResponse<AiScreeningResultRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/screening/:id/override` | `{ decision: 'Shortlisted' \| 'Rejected' \| 'Hold', reason: string }` | `AiScreeningResultRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `PUT` | `/screening/:id/parsed-fields` | `{ correctedFields: Record<string, string> }` | `AiScreeningResultRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/screening/toggle-blind` | `{ jobId: string, blindScreeningEnabled: boolean }` | `{ jobId: string; blindScreeningEnabled: boolean }` | `super_admin`, `hr_admin` | Required from backend |

---

## 7. Application Pipeline (`pipeline`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/pipeline` | `?jobId=&stage=&search=&page=&pageSize=&sortBy=&sortDir=` | `PipelineBoardResponse` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/pipeline/move` | `{ applicationIds: string[], targetStage: PipelineStageId, reason?: string, sendNotification?: boolean }` | `{ movedCount: number; updatedItems: PipelineApplicationCard[] }` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `GET` | `/pipeline/export` | `?jobId=&format=csv\|xlsx` | `Blob` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 8. Assessments & Tests (`assessments`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/assessments/templates` | `?type=&search=` | `PaginatedResponse<AssessmentTemplateRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `GET` | `/assessments/attempts` | `?jobId=&status=&page=&pageSize=` | `PaginatedResponse<CandidateAssessmentAttemptRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `candidate` | Required from backend |
| `POST` | `/assessments/assign` | `{ candidateId: string, jobId: string, templateId: string, dueInHours: number }` | `CandidateAssessmentAttemptRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/assessments/attempts/:id/retest` | `{ reason: string }` | `CandidateAssessmentAttemptRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 9. Interview Scheduling & Management (`interviews`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/interviews` | `?from=&to=&interviewerId=&jobId=&status=&view=day\|week\|month` | `PaginatedResponse<InterviewScheduleRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |
| `POST` | `/interviews` | `ScheduleInterviewPayload` | `InterviewScheduleRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/interviews/:id/reschedule` | `{ startAt: string, endAt: string, reason: string }` | `InterviewScheduleRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager` | Required from backend |
| `POST` | `/interviews/:id/status` | `{ status: 'Completed' \| 'Cancelled' \| 'NoShow', reason?: string }` | `InterviewScheduleRecord` | `super_admin`, `hr_admin`, `recruiter`, `interviewer` | Required from backend |

---

## 10. AI Video Interview (`video-interviews`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/video-interviews/templates` | None | `PaginatedResponse<AiVideoTemplateRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |
| `POST` | `/video-interviews/templates` | `CreateAiVideoTemplatePayload` | `AiVideoTemplateRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `GET` | `/video-interviews/submissions` | `?jobId=&status=` | `PaginatedResponse<AiVideoSubmissionRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer`, `candidate` | Required from backend |
| `POST` | `/video-interviews/submissions/:id/decision` | `{ decision: 'Shortlisted' \| 'Rejected', reviewerNotes: string }` | `AiVideoSubmissionRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |

---

## 11. Evaluation & Scorecards (`scorecards`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/scorecards` | `?jobId=&candidateId=&status=` | `PaginatedResponse<InterviewScorecardRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |
| `POST` | `/scorecards` | `SubmitScorecardPayload` | `InterviewScorecardRecord` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |
| `POST` | `/scorecards/:id/chase` | `{}` | `{ reminderSentAt: string }` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 12. Offer Management (`offers`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/offers` | `?status=&jobId=&page=&pageSize=` | `PaginatedResponse<OfferRecord>` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |
| `POST` | `/offers/preview-breakup` | `{ templateId: string, offeredAnnualCtc: number, location: string, grade: string }` | `OfferCompensationBreakup` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/offers` | `CreateOfferPayload` | `OfferRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/offers/:id/send-esign` | `{}` | `OfferRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/offers/:id/withdraw` | `{ reason: string }` | `OfferRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `GET` | `/offers/:id/pdf` | None | `Blob` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver`, `candidate` | Required from backend |

---

## 13. Background Verification (`bgv`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/bgv/cases` | `?status=&vendor=&page=&pageSize=` | `PaginatedResponse<BgvCaseRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/bgv/cases` | `InitiateBgvPayload` | `BgvCaseRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/bgv/cases/:id/clearance` | `{ decision: 'Cleared' \| 'Discrepancy' \| 'Rejected', remarks: string }` | `BgvCaseRecord` | `super_admin`, `hr_admin` | Required from backend |

---

## 14. Onboarding Handoff (`onboarding-handoff`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/onboarding-handoffs` | `?status=&page=&pageSize=` | `PaginatedResponse<OnboardingHandoffRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/onboarding-handoffs/:id/convert` | `{ confirmedJoiningDate: string, triggerItAssets: boolean, triggerPayrollSetup: boolean }` | `OnboardingHandoffRecord` | `super_admin`, `hr_admin` | Required from backend |
| `POST` | `/onboarding-handoffs/:id/no-show` | `{ reason: string, initiateBackfillRequisition: boolean }` | `OnboardingHandoffRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 15. Referrals (`referrals`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/referrals` | `?status=&jobId=&page=&pageSize=` | `ReferralsWorkspaceResponse` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer` | Required from backend |
| `POST` | `/referrals` | `CreateReferralPayload` | `ReferralSubmissionRecord` | All authenticated internal roles | Required from backend |

---

## 16. Vendors / Agencies (`vendors`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendors` | `?status=&page=&pageSize=` | `PaginatedResponse<VendorAgencyRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/vendors` | `CreateVendorAgencyPayload` | `VendorAgencyRecord` | `super_admin`, `hr_admin` | Required from backend |
| `POST` | `/vendors/:id/assign-jobs` | `{ jobIds: string[] }` | `VendorAgencyRecord` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 17. Communication Center (`communications`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/communications/templates` | `?channel=Email\|SMS\|WhatsApp` | `PaginatedResponse<CommunicationTemplateRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `GET` | `/communications/logs` | `?candidateId=&channel=&page=&pageSize=` | `PaginatedResponse<CommunicationLogRecord>` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |
| `POST` | `/communications/send-bulk` | `{ candidateIds: string[], templateId: string, channel: 'Email' \| 'SMS' \| 'WhatsApp' }` | `{ queuedCount: number }` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 18. Approvals Workflow (`approvals`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/approvals` | `?type=&status=&page=&pageSize=` | `PaginatedResponse<RecruitmentApprovalItem>` | `super_admin`, `hr_admin`, `approver`, `hiring_manager` | Required from backend |
| `POST` | `/approvals/decide` | `{ approvalIds: string[], decision: 'Approved' \| 'Rejected' \| 'Delegated', comments: string, delegateToUserId?: string }` | `{ processedCount: number }` | `super_admin`, `hr_admin`, `approver`, `hiring_manager` | Required from backend |

---

## 19. Reports & Analytics (`reports`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports/catalog` | None | `RecruitmentReportDefinition[]` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |
| `GET` | `/reports/:reportKey/run` | `?from=&to=&departmentId=&page=&pageSize=` | `RecruitmentReportRunResponse` | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `approver` | Required from backend |
| `GET` | `/reports/:reportKey/export` | `?format=csv\|xlsx\|pdf&from=&to=` | `Blob` | `super_admin`, `hr_admin`, `recruiter` | Required from backend |

---

## 20. Settings & Automation Rules (`settings`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/settings` | None | `RecruitmentSettingsResponse` | `super_admin`, `hr_admin` | Required from backend |
| `PUT` | `/settings/automation-rules/:ruleId` | `{ enabled: boolean, thresholdValue?: number, slaHours?: number }` | `RecruitmentAutomationRule` | `super_admin`, `hr_admin` | Required from backend |
| `PUT` | `/settings/gdpr-retention` | `{ retentionMonths: number, autoAnonymizeExpired: boolean, dpdpConsentRequired: boolean }` | `RecruitmentSettingsResponse` | `super_admin`, `hr_admin` | Required from backend |

---

## 21. Audit Logs (`audit-logs`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/audit-logs` | `?actor=&action=&entityType=&from=&to=&page=&pageSize=` | `PaginatedResponse<RecruitmentAuditLogRecord>` | `super_admin`, `hr_admin` | Required from backend |
| `GET` | `/audit-logs/export` | `?format=csv` | `Blob` | `super_admin`, `hr_admin` | Required from backend |

---

## 22. Notifications (`notifications`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | `?unreadOnly=&page=&pageSize=` | `PaginatedResponse<RecruitmentNotificationRecord>` | All roles | Required from backend |
| `POST` | `/notifications/mark-read` | `{ notificationIds: string[] }` | `{ markedCount: number }` | All roles | Required from backend |

---

## 23. Hiring Manager Portal (`hiring-manager`)
| Method | Path | Query / Body | Response Type | Permissions | Backend Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/hiring-manager/workspace` | None | `HiringManagerWorkspaceResponse` | `super_admin`, `hr_admin`, `hiring_manager` | Required from backend |
| `POST` | `/hiring-manager/candidates/:id/quick-decision` | `{ jobId: string, decision: 'Shortlist' \| 'Reject' \| 'ScheduleInterview', notes: string }` | `{ status: string }` | `super_admin`, `hr_admin`, `hiring_manager` | Required from backend |
