# OFC360 — Intelligent HR & Workforce Management Platform

> **Enterprise Human Resource Management System (HRMS), Talent Acquisition (ATS), Attendance Biometrics, Payroll Engine & Workforce Analytics**  
> *Architected with Next.js 15, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit, RTK Query, and Expo Mobile Shell with Zero-Backend Local Persistence & Authenticated REST API Gateway.*

---

## 📌 Start Here — Executive & Technical Navigation

This documentation serves as the **definitive architectural and functional specification** for the OFC360 platform. Depending on your role, jump directly to the section most relevant to your workflow:

```mermaid
flowchart TD
    Start([OFC360 Documentation Hub]) --> Audience{Select Your Role}
    Audience -->|HR & Product Stakeholders| HR[1. Introduction<br/>2. Platform at a Glance<br/>3. Complete HR Lifecycle<br/>12. Real Business Workflows]
    Audience -->|Frontend & Full-Stack Devs| Dev[5. Module Documentation<br/>7. Frontend Architecture<br/>10. Auth & RBAC<br/>16. Local Development Setup]
    Audience -->|Architects & Tech Leads| Arch[6. System Architecture<br/>8. Backend Contracts<br/>9. Database & ER Diagram<br/>11. API Inventory]
    Audience -->|DevOps & Security Engineers| DevOps[10. Security & Biometric Vault<br/>14. Integrations<br/>17. Deployment Architecture<br/>20. Troubleshooting]
```

### Table of Contents

1. [OFC360 Introduction](#1-ofc360-introduction)
   - [Core Purpose & Value Proposition](#core-purpose--value-proposition)
   - [Problems OFC360 Solves](#problems-ofc360-solves)
   - [Primary Target Personas](#primary-target-personas)
   - [Architecture Realities & Repository Boundary](#architecture-realities--repository-boundary)
2. [Platform at a Glance](#2-platform-at-a-glance)
   - [Feature Overview Matrix](#feature-overview-matrix)
3. [Complete HR Lifecycle](#3-complete-hr-lifecycle)
   - [22-Stage Workforce Lifecycle Pipeline](#22-stage-workforce-lifecycle-pipeline)
   - [End-to-End Lifecycle Sequence Diagram](#end-to-end-lifecycle-sequence-diagram)
   - [Detailed Stage-by-Stage Breakdown](#detailed-stage-by-stage-breakdown)
4. [Role-Based Access Control (RBAC) & Persona Portals](#4-role-based-access-control-rbac--persona-portals)
   - [The 6 Enterprise Roles](#the-6-enterprise-roles)
   - [Route Guard Matrix](#route-guard-matrix)
   - [Role Portal Roots](#role-portal-roots)
5. [Complete Feature & Module Documentation](#5-complete-feature--module-documentation)
   - [A. Authentication & Security Engine](#a-authentication--security-engine)
   - [B. Organization & Workforce Directory](#b-organization--workforce-directory)
   - [C. Talent Acquisition & ATS (23 Sub-Modules)](#c-talent-acquisition--ats-23-sub-modules)
   - [D. Employee Onboarding (24 Sub-Modules)](#d-employee-onboarding-24-sub-modules)
   - [E. Attendance, Geofencing & Biometric Time Tracking](#e-attendance-geofencing--biometric-time-tracking)
   - [F. Holiday & Calendar Governance (22 Sub-Modules)](#f-holiday--calendar-governance-22-sub-modules)
   - [G. Enterprise Payroll & Statutory Engine (19 Sub-Modules)](#g-enterprise-payroll--statutory-engine-19-sub-modules)
   - [H. Performance Management, OKRs & 360 Feedback](#h-performance-management-okrs--360-feedback)
   - [I. Employee Self-Service (ESS) & My Dashboard](#i-employee-self-service-ess--my-dashboard)
   - [J. Approvals, Rosters & Announcements](#j-approvals-rosters--announcements)
   - [K. HR & Payroll Analytics Intelligence](#k-hr--payroll-analytics-intelligence)
   - [L. Asset Management (Procurement to Retirement — 25 Sub-Modules)](#l-asset-management-procurement-to-retirement--25-sub-modules)
   - [M. Document Vault, OCR & Expiry Governance](#m-document-vault-ocr--expiry-governance)
   - [N. Travel Desk, Itinerary Booking & Expense Claims](#n-travel-desk-itinerary-booking--expense-claims)
   - [O. Visitor Security & Material Pass (24 Sub-Modules)](#o-visitor-security--material-pass-24-sub-modules)
   - [P. Helpdesk, SLA Escalation & Confidential Whistleblower Portal](#p-helpdesk-sla-escalation--confidential-whistleblower-portal)
   - [Q. Enterprise Company Settings & Security Policy](#q-enterprise-company-settings--security-policy)
6. [System Architecture — Complete Explanation](#6-system-architecture--complete-explanation)
   - [Architectural Pattern: Dual-Mode Enterprise Client](#architectural-pattern-dual-mode-enterprise-client)
   - [High-Level Architecture Diagram](#high-level-architecture-diagram)
   - [End-to-End Request & Data Flow](#end-to-end-request--data-flow)
7. [Frontend Architecture](#7-frontend-architecture)
   - [App Router Structure & Navigation Tree](#app-router-structure--navigation-tree)
   - [State Management & Redux Store](#state-management--redux-store)
   - [RTK Query APIs & Transport Adapter](#rtk-query-apis--transport-adapter)
   - [UI Component Hierarchy: WorkspaceShells & Primitives](#ui-component-hierarchy-workspaceshells--primitives)
   - [Mobile Architecture: Expo & React Native Web](#mobile-architecture-expo--react-native-web)
8. [Backend Architecture & API Contracts](#8-backend-architecture--api-contracts)
   - [API Contract Specifications (`docs/*.md`)](#api-contract-specifications-docsmd)
   - [Local Mock & Persistence Engine (`local-mock-engine.ts`)](#local-mock--persistence-engine-local-mock-enginets)
9. [Database Architecture & Entity Relationship (ER) Model](#9-database-architecture--entity-relationship-er-model)
   - [Enterprise ER Diagram](#enterprise-er-diagram)
   - [Core Data Entities & Models](#core-data-entities--models)
   - [Multi-Tenant Isolation Strategy](#multi-tenant-isolation-strategy)
10. [Authentication, Security & Biometric Privacy](#10-authentication-security--biometric-privacy)
    - [JWT Session Lifecycle & Refresh Coalescing](#jwt-session-lifecycle--refresh-coalescing)
    - [Biometric & Coordinate Transient Vault (`captureVault.ts`)](#biometric--coordinate-transient-vault-capturevaultts)
    - [Authentication Sequence Diagram](#authentication-sequence-diagram)
11. [API Architecture & Endpoint Inventory](#11-api-architecture--endpoint-inventory)
    - [API Base Prefixes](#api-base-prefixes)
    - [Comprehensive Endpoint Reference Table](#comprehensive-endpoint-reference-table)
12. [How OFC360 Works — Real Business Workflows](#12-how-ofc360-works--real-business-workflows)
    - [Workflow 1: Hiring & Onboarding an Employee](#workflow-1-hiring--onboarding-an-employee)
    - [Workflow 2: Daily Biometric Attendance Punch with Geofencing](#workflow-2-daily-biometric-attendance-punch-with-geofencing)
    - [Workflow 3: Shift Rostering & Regularization Approval](#workflow-3-shift-rostering--regularization-approval)
    - [Workflow 4: Monthly Payroll Processing & F&F Settlement](#workflow-4-monthly-payroll-processing--ff-settlement)
    - [Workflow 5: Performance Review Cycle & 360 Feedback](#workflow-5-performance-review-cycle--360-feedback)
    - [Workflow 6: Asset Allocation & Exit Clearance](#workflow-6-asset-allocation--exit-clearance)
    - [Workflow 7: Whistleblower Complaint & SLA Resolution](#workflow-7-whistleblower-complaint--sla-resolution)
13. [AI & Automation Architecture](#13-ai--automation-architecture)
    - [Google Gemini API Integration](#google-gemini-api-integration)
    - [AI Attendance Anomaly Monitoring](#ai-attendance-anomaly-monitoring)
    - [AI Resume Parsing & Match Scoring](#ai-resume-parsing--match-scoring)
    - [Helpdesk Sentiment & Smart Reply Engine](#helpdesk-sentiment--smart-reply-engine)
14. [External Integrations](#14-external-integrations)
15. [Project Folder Structure](#15-project-folder-structure)
16. [Local Development & Setup Guide](#16-local-development--setup-guide)
17. [Deployment Architecture](#17-deployment-architecture)
18. [Testing & Quality Assurance](#18-testing--quality-assurance)
19. [Feature Implementation Matrix](#19-feature-implementation-matrix)
20. [Practical Troubleshooting Guide](#20-practical-troubleshooting-guide)
21. [Development Guidelines & Contribution Standards](#21-development-guidelines--contribution-standards)
22. [Product Roadmap & Technical Gaps](#22-product-roadmap--technical-gaps)

---

# 1. OFC360 Introduction

### Core Purpose & Value Proposition

**OFC360** is an enterprise-grade, multi-tenant Human Resource Management System (HRMS), Talent Acquisition Suite (ATS), Biometric Attendance Tracker, Automated Payroll Processor, and Workforce Intelligence Platform.

Modern enterprises struggle with fragmented HR operations: recruitment happens in one tool, attendance is recorded on legacy physical biometric hardware, leave is tracked via email, payroll is calculated in spreadsheets, and performance reviews occur in disconnected forms. OFC360 eliminates this fragmentation by consolidating the **entire employee lifecycle into a single unified platform**.

OFC360 is engineered to operate seamlessly across two delivery form-factors:
1. **Next.js 15 Web & Desktop SaaS Application**: A responsive, high-density web portal featuring specialized workspace shells for HR Admins, Managers, Executives, IT Security, and Employees.
2. **React Native Mobile App Shell (Expo SDK 52 / PWA)**: An adaptive mobile experience enabling geo-fenced biometric face check-in, real-time approval queues, instant announcements, and self-service access on iOS and Android devices.

---

### Problems OFC360 Solves

| Operational Bottleneck | Traditional HR Pain Point | OFC360 Architectural Solution |
| :--- | :--- | :--- |
| **Recruitment Delays & Fragmented ATS** | Candidate resumes lost across inboxes; sluggish interview scheduling and manual evaluation. | **23-module ATS** featuring Kanban pipeline stages, automated interview scheduling, scorecard calibration, and automated offer letter generation. |
| **Buddy Punching & Inaccurate Time Tracking** | Proxy punches, manual attendance registers, unverified remote clock-ins. | **AI Face Biometric Punching** combined with high-precision GPS geofencing, transient liveness capture, and automated LOP (Loss of Pay) synchronization. |
| **Payroll Errors & Statutory Penalties** | Disconnected attendance and leave balances leading to manual calculation mistakes in PF, ESI, TDS, and PT. | **Automated 19-module Payroll Engine** calculating gross-to-net pay, statutory deductions, tax projections, arrear adjustments, and bank NEFT batch files. |
| **Siloed Asset Governance** | Laptops, accessories, and licenses unaccounted for during employee turnover. | **25-module IT Asset Lifecycle** tracking procurement, serial numbers, allocation receipts, warranty expiries, and automated exit clearance handoffs. |
| **Slow Multi-Level Approvals** | Leave, expense, travel, and regularization requests delayed across disparate systems. | **Centralized Approval Pipeline** with multi-tier role routing, instant push notifications, and automated escalation triggers. |
| **Employee Inquiries Burdening HR** | HR teams overwhelmed with routine requests for payslips, tax forms, and policies. | **Comprehensive Employee Self-Service (ESS)** portal with instant download of verified payslips, tax calculators, document requests, and helpdesk ticketing. |

---

### Primary Target Personas

```mermaid
mindmap
  root((OFC360 Personas))
    HR_Admin["HR Administrator<br/>• Full lifecycle oversight<br/>• Org directory & rosters<br/>• Payroll approvals<br/>• Policy configuration"]
    Employee["Employee (ESS)<br/>• Face punch & geofence<br/>• Leave balance & apply<br/>• Payslip downloads<br/>• Document vault"]
    Manager["Team Manager<br/>• Direct report roster<br/>• Leave & OT approval<br/>• Performance reviews<br/>• Headcount requests"]
    Executive["C-Suite & Board<br/>• Retention velocity<br/>• Payroll burn rate<br/>• Headcount forecasting<br/>• Anomaly intelligence"]
    IT_Admin["IT & Facilities<br/>• Asset provisioning<br/>• Security posture<br/>• SSO / SCIM identity<br/>• Exit asset clearance"]
    Super_Admin["Super Administrator<br/>• Multi-tenant controls<br/>• Billing & subscriptions<br/>• Platform audit logs<br/>• Global policy overrides"]
```

---

### Architecture Realities & Repository Boundary

> [!IMPORTANT]
> **Verified Repository Architecture**  
> An inspection of this repository confirms that it contains the **complete OFC360 frontend application, mobile shell, typed API contracts, and zero-backend local execution engine**.  
> - **Frontend Web**: Next.js 15.4.9 (App Router), React 19.2.1, TypeScript 5.9.3, Tailwind CSS v4, Lucide React, Redux Toolkit, and RTK Query.
> - **Mobile Application**: Expo SDK 52, React Native 0.76.5, `react-native-web` 0.21.4 with cross-platform primitives.
> - **API Contracts**: Formal REST API specifications are documented in `docs/*.md` covering 8 major enterprise domains.
> - **Local Mock Engine**: `src/services/local-mock-engine.ts` (2,638 lines) provides in-memory and `localStorage` persistence, allowing the application to execute fully offline with zero external services.
> - **External Backend Gateway**: Configured via `NEXT_PUBLIC_API_URL` to route requests to the Python FastAPI backend (`https://api.ofc360.com`). The backend repository itself is hosted separately.

---

# 2. Platform at a Glance

### Feature Overview Matrix

The following table reflects the actual codebase implementation status across all discovered domains:

| Functional Module | Primary Business Purpose | Primary Users | Actual Codebase Status | Supporting Source Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Sessions** | JWT auth, session restore, password reset, MFA, OTP, account activation | All Personas | **Implemented** | [lib/auth-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-api.ts), [lib/auth-schemas.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-schemas.ts), [app/login/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/login/page.tsx) |
| **Role-Based Routing & Guards** | Enforces persona boundary checks across 6 roles, preventing unauthorized access | All Personas | **Implemented** | [lib/route-guards.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/route-guards.ts), [components/auth/role-route-guard.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/components/auth/role-route-guard.tsx) |
| **Workforce Directory & Org Chart** | Headcount tracking, department hierarchies, reporting lines, employee creation | HR Admin, Managers | **Implemented** | [app/admin/workforce/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/admin/workforce/page.tsx), [lib/admin-workforce-store.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/admin-workforce-store.ts), [lib/org-chart-logic.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/org-chart-logic.ts) |
| **Biometric Face Attendance** | Camera capture, transient image vault, GPS geofencing, check-in/out, breaks | Employees, HR Admin | **Implemented** | [src/features/attendance/attendanceApi.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/attendanceApi.ts), [src/features/attendance/captureVault.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/captureVault.ts) |
| **Shifts, Rosters & Regularization** | Shift creation, weekly roster assignments, swap approvals, missed punch regularizations | Managers, HR Admin | **Implemented** | [lib/store/hr-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/hr-api.ts), [src/screens/ShiftsAndRostersScreen.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/screens/ShiftsAndRostersScreen.tsx) |
| **Attendance Analytics & KPIs** | 12 KPIs, Bradford factor, absenteeism heatmaps, overtime analysis, live tracking | HR, Executives | **Implemented** | [app/attendance-analytics/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/attendance-analytics/page.tsx), [src/services/attendance-analytics/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/attendance-analytics/) |
| **Holidays & Calendar Governance** | 22 sub-modules: master lists, optional holidays, comp-off swaps, site calendars | All Personas | **Implemented** | [app/holidays/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/holidays/page.tsx), [src/services/holidays/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/holidays/) |
| **Talent Acquisition & ATS** | 23 sub-modules: requisitions, job postings, candidate pipeline, scorecards, offers | Recruiters, HR Admin | **Implemented** | [app/recruitment/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/recruitment/page.tsx), [src/services/recruitment/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/recruitment/) |
| **Employee Onboarding** | 24 sub-modules: pre-boarding, document verification, induction, 30-60-90 check-ins | HR Admin, Joiners | **Implemented** | [app/onboarding/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/onboarding/page.tsx), [src/services/onboarding/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/onboarding/) |
| **Payroll Processing Engine** | 19 sub-modules: salary structures, LOP sync, loans, PF/ESI/PT, payslips, bank batches | Payroll Officer, HR | **Implemented** | [app/payroll/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/payroll/page.tsx), [src/services/payroll/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/payroll/) |
| **Payroll Analytics & Anomaly Audit** | Variance analysis, salary distribution, tax liability alerts, audit trails | Executives, Finance | **Implemented** | [app/payroll-analytics/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/payroll-analytics/page.tsx), [lib/store/payroll-analytics-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/payroll-analytics-api.ts) |
| **Performance Goals & OKRs** | Goal hierarchies, review cycles (quarterly/annual), 360 feedback, PIP tracking | Employees, Managers | **Implemented** | [app/performance/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/performance/page.tsx), [src/services/performance/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/performance/) |
| **Employee Self-Service (ESS)** | Personal dashboard, time-off requests, compensation cards, helpdesk, documents | Employees | **Implemented** | [app/employee/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/employee/page.tsx), [src/services/employee-dashboard/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/employee-dashboard/) |
| **Manager Portal** | Team attendance status, approval queues, team rosters, direct-report reviews | Managers | **Implemented** | [app/manager/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/manager/page.tsx), [lib/manager-portal-logic.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/manager-portal-logic.ts) |
| **Executive Command Center** | Org retention velocity, payroll cost trend, strategic headcount, AI summaries | C-Suite (CEO, CFO) | **Implemented** | [app/executive/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/executive/page.tsx), [lib/executive-portal-logic.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/executive-portal-logic.ts) |
| **IT Admin Console** | Asset provisioning, SAML/SCIM identity posture, device checks, exit clearance | IT Administrators | **Implemented** | [app/it-admin/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/it-admin/page.tsx), [lib/it-admin-portal-logic.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/it-admin-portal-logic.ts) |
| **Asset Lifecycle Management** | 25 sub-modules: asset register, vendors, depreciation, QR tagging, recovery | IT & Facilities | **Implemented** | [app/assets/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/assets/page.tsx), [src/services/assets/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/assets/) |
| **Document Vault & OCR** | 8 categories, verification status, expiry alerts, template generator | HR Admin, Employees | **Implemented** | [app/documents/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/documents/page.tsx), [src/services/employee-documents/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/employee-documents/) |
| **Travel Desk & Expenses** | Itinerary booking, travel policy enforcement, multi-level approvals, claims | Employees, Managers | **Implemented** | [app/travel/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/travel/page.tsx), [src/services/travel-desk/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/travel-desk/) |
| **Visitor Security Management** | 24 sub-modules: pre-registration, kiosk check-in, host alerts, material gate pass | Reception, Security | **Implemented** | [app/visitors/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/visitors/page.tsx), [src/services/visitors/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/visitors/) |
| **Enterprise Helpdesk & POSH** | Tickets, SLA countdown, knowledge base, confidential harassment complaints | All Personas | **Implemented** | [app/helpdesk/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/helpdesk/page.tsx), [lib/store/helpdesk-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/helpdesk-api.ts) |
| **Company Settings & Configuration** | Policy toggles, attendance rules, branding, security thresholds | HR & Super Admin | **Implemented** | [app/settings/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/settings/page.tsx), [src/services/settingsApi.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/settingsApi.ts) |
| **AI Assistants & Gemini API** | AI attendance anomaly detection, AI resume screening, helpdesk smart suggestions | HR, Support | **Implemented** | [@google/genai](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/package.json#L13), [components/helpdesk/ai-assistance-modal.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/components/helpdesk/ai-assistance-modal.tsx) |
| **FastAPI Backend & PostgreSQL** | Core database persistence, Celery background queues, Alembic migrations | Infrastructure | **External Contract** | Detailed in [docs/*.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs) (Client mock fallback implemented) |

---

# 3. Complete HR Lifecycle

OFC360 natively supports the **complete 22-stage employee journey** from talent acquisition and hiring through active workforce operations, compensation, and eventual offboarding.

```mermaid
flowchart TD
    subgraph SOURCING["1. Sourcing & Acquisition"]
        A1[1. Manpower Planning] --> A2[2. Job Requisition]
        A2 --> A3[3. Candidate Sourcing & Career Portal]
        A3 --> A4[4. AI Resume Screening & Scoring]
        A4 --> A5[5. Interview Scheduling & Evaluation]
        A5 --> A6[6. Offer Letter & BGV Verification]
    end

    subgraph ONBOARDING["2. Joining & Orientation"]
        A6 --> B1[7. Pre-boarding Portal]
        B1 --> B2[8. Document Collection & KYC OCR]
        B2 --> B3[9. IT Asset & Email Provisioning]
        B3 --> B4[10. Day-1 Induction & Buddy Assignment]
        B4 --> B5[11. Department & Manager Assignment]
    end

    subgraph WORKFORCE_OPS["3. Active Workforce Operations"]
        B5 --> C1[12. Biometric Attendance & Geofencing]
        C1 --> C2[13. Shift Schedules & Rostering]
        C2 --> C3[14. Leave & Holiday Approvals]
        C3 --> C4[15. Performance Goals & OKRs]
        C4 --> C5[16. 360 Feedback & Appraisals]
        C5 --> C6[17. Travel Desk & Expense Claims]
    end

    subgraph COMPENSATION["4. Payroll & Rewards"]
        C1 -.-> D1[18. Attendance & LOP Sync]
        C3 -.-> D1
        D1 --> D2[19. Salary Calculation & Deductions]
        D2 --> D3[20. Statutory Compliance PF/ESI/TDS]
        D3 --> D4[21. Payslip Generation & Bank Batch]
    end

    subgraph OFFBOARDING["5. Separation & Settlement"]
        C6 --> E1[22. Resignation & Exit Clearance]
        E1 --> E2[Full & Final Settlement F&F]
        E2 --> E3[Asset Recovery & Account Deactivation]
    end
```

### Detailed Stage-by-Stage Breakdown

| Stage | Business Trigger | Primary Actor | Frontend Screen / Route | API / Service Endpoint | Output & Integration | Verified Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Manpower Planning** | Annual or quarterly department growth targets | Department Head, HR Admin | `/recruitment/requisitions` | `GET/POST /api/v1/recruitment/requisitions` | Approved hiring budget; requisitions feed job postings | **Implemented** |
| **2. Job Requisition** | Position vacancy or expansion requirement | Hiring Manager | `/recruitment/requisitions` | `POST /api/v1/recruitment/requisitions` | Job description, CTC budget, and requisition approval | **Implemented** |
| **3. Candidate Sourcing** | Published requisition goes live on portal | Recruiter | `/recruitment/career-portal` | `POST /api/v1/recruitment/job-postings` | Public candidate applications received | **Implemented** |
| **4. AI Resume Screening** | New applicant uploads CV/resume | System, Recruiter | `/recruitment/resume-screening` | `POST /api/v1/recruitment/candidates/parse` | Extracted skills, experience, and candidate score match | **Implemented** |
| **5. Interview Scheduling** | Candidate shortlisted in pipeline | Interviewer, Manager | `/recruitment/interviews` | `POST /api/v1/recruitment/interviews/schedule` | Calendar invite, scorecard rating, feedback records | **Implemented** |
| **6. Offer Management & BGV** | Candidate passes interview evaluation | HR Admin | `/recruitment/offers` | `POST /api/v1/recruitment/offers/generate` | Digital offer letter, compensation breakdown, BGV trigger | **Implemented** |
| **7. Pre-Boarding Portal** | Candidate accepts offer letter | New Joiner | `/onboarding/joiner-portal` | `GET /api/v1/onboarding/portal/bootstrap` | Joiner account activation, welcome kit preferences | **Implemented** |
| **8. Document Collection & KYC** | Joiner initiates onboarding checklist | New Joiner, HR | `/onboarding/documents` | `POST /api/v1/onboarding/documents/upload` | Aadhaar, PAN, Bank details, Education certificates verified | **Implemented** |
| **9. IT Asset Provisioning** | 3 days prior to employee joining date | IT Admin | `/assets/allocation`, `/it-admin` | `POST /api/v1/assets/allocate` | Serial-numbered laptop, email ID, and badge assigned | **Implemented** |
| **10. Day-1 Induction** | Employee first day at office / remote | HR Admin, Buddy | `/onboarding/day-one` | `POST /api/v1/onboarding/induction/complete` | Welcome kit issued, policy sign-offs, buddy assigned | **Implemented** |
| **11. Department Assignment** | Day-1 onboarding checklist finalized | HR Admin | `/admin/workforce` | `POST /api/v1/hr/admin-employees` | Employee record created in directory and org chart | **Implemented** |
| **12. Attendance Tracking** | Daily shift start / end | Employee | `/dashboard/hr-admin`, `/employee` | `POST /api/v1/attendance/punch` | Geofenced face punch recorded; hours computed | **Implemented** |
| **13. Shift & Rostering** | Weekly / monthly schedule planning | Manager | `/dashboard/hr-admin?tab=shifts` | `POST /api/v1/hr/rosters/assign` | Shift assigned (Morning, General, Night, Flexi, Off) | **Implemented** |
| **14. Leave & Holidays** | Time-off application by employee | Employee, Manager | `/holidays`, `/employee` | `POST /api/v1/hr/approvals/action` | Leave balance deducted; calendar updated | **Implemented** |
| **15. Goal Setting & OKRs** | Quarter start or performance cycle launch | Manager, Employee | `/performance` | `POST /api/v1/performance/goals` | Individual and team OKRs with weighted key results | **Implemented** |
| **16. 360 Appraisals** | Mid-year or annual review cycle | All Employees | `/performance` | `POST /api/v1/performance/reviews` | Self-assessment, manager rating, peer 360 feedback | **Implemented** |
| **17. Travel & Expenses** | Business travel requirement | Employee, Manager | `/travel` | `POST /api/v1/travel/requests` | Itinerary booking, travel advance, expense settlement | **Implemented** |
| **18. Attendance & LOP Sync** | Payroll cut-off date (25th of month) | System | `/payroll/attendance-lop` | `GET /api/v1/payroll/attendance-lop` | Loss of Pay days and overtime hours finalized | **Implemented** |
| **19. Salary Calculation** | Payroll execution trigger | Payroll Officer | `/payroll/pay-calendar` | `POST /api/v1/payroll/runs/execute` | Gross earnings, tax projections, net pay calculated | **Implemented** |
| **20. Statutory Compliance** | Post-payroll calculation | Payroll Admin | `/payroll/statutory` | `GET /api/v1/payroll/statutory/overview` | PF ECR file, ESI returns, PT report, Form 16 TDS data | **Implemented** |
| **21. Disbursement & Payslips** | Month-end salary payment date | Finance Admin | `/payroll/payslips`, `/payroll/bank-disbursement` | `POST /api/v1/payroll/disbursement/generate-batch` | Bank NEFT batch file exported; digital payslips published | **Implemented** |
| **22. Resignation & F&F Exit** | Employee submits resignation | Manager, HR, IT | `/onboarding/joiners` (Exit flow), `/payroll/fnf-settlement` | `POST /api/v1/payroll/fnf/calculate` | Department clearances, asset returns, gratuity/leave encashment | **Implemented** |

---

# 4. Role-Based Access Control (RBAC) & Persona Portals

### The 6 Enterprise Roles

OFC360 enforces a strict **6-tier enterprise RBAC model** defined in [lib/auth-schemas.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-schemas.ts#L6-L12):

1. **`super_admin`**: Global tenant governance, subscription billing, multi-region policy controls, platform audit logs, and complete system overrides.
2. **`hr_admin`**: Full operational access across workforce directories, organizational charts, shift schedules, rosters, leaves, payroll cycles, and recruitment pipelines.
3. **`it_admin`**: IT security, hardware asset inventory, SAML 2.0 / SSO configurations, SCIM user provisioning, device posture monitoring, and offboarding asset clearances.
4. **`manager`**: Team-level workspace governing direct reports, shift roster assignments, leave and regularization approvals, performance appraisals, and candidate interviews.
5. **`executive`**: C-Suite Command Center (CEO, CFO, COO, CTO) providing enterprise retention velocity, payroll cost variance, headcount forecasts, and board summaries.
6. **`employee`**: Employee Self-Service (ESS) portal for biometric face attendance, leave balances, payslip downloads, personal document vault, and helpdesk tickets.

---

### Route Guard Matrix

OFC360 implements zero-trust route guards via `canRoleAccessRoute()` in [lib/route-guards.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/route-guards.ts#L177-L295). Route attempts outside authorized scopes are automatically redirected to `/dashboard/forbidden`:

| Route Prefix | `super_admin` | `hr_admin` | `it_admin` | `manager` | `executive` | `employee` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/dashboard/super-admin` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard/hr-admin` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/admin/workforce` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard/it-admin`, `/it-admin` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/assets/*` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/dashboard/manager`, `/manager` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/executive`, `/executive` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/payroll/*`, `/payroll` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/payroll-analytics` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `/recruitment/*` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `/onboarding/*` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `/attendance-analytics/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/performance` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `/holidays/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/travel` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `/visitors/*` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/documents` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/helpdesk/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `/settings` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/employee`, `/employee` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/my-dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# 5. Complete Feature & Module Documentation

### A. Authentication & Security Engine

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Next.js App Shell
    participant Guard as RoleRouteGuard
    participant Auth as authClient (lib/auth-api.ts)
    participant Vault as captureVault.ts
    participant Gateway as API Gateway / Mock Engine

    User->>App: Submits Email & Password
    App->>Auth: login(email, password)
    Auth->>Gateway: POST /api/v1/auth/login
    Gateway-->>Auth: 200 OK { access_token, user: { role, full_name, ... } }
    Auth->>Auth: Store token in-memory & broadcast session
    App->>Guard: Navigate to target route
    Guard->>Guard: canRoleAccessRoute(user.role, targetPath)
    alt Allowed
        Guard-->>App: Render Persona Dashboard
    else Forbidden
        Guard-->>App: Redirect to /dashboard/forbidden
    end
```

- **Purpose**: Authenticates identities, manages cryptographic sessions, enforces role-based authorization, and protects confidential employee records.
- **Key Files**:
  - [lib/auth-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-api.ts): Centralized singleton `authClient` providing token persistence, refresh coalescing, and session broadcasting.
  - [lib/auth-schemas.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-schemas.ts): Zod schemas for login, workspace registration, phone E.164 formatting, and password strength scoring.
  - [lib/route-guards.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/route-guards.ts): Zero-trust path verification protecting all internal routes.
- **Features Implemented**:
  - Secure credential login, user registration, workspace creation.
  - 6-digit OTP email/SMS verification and Multi-Factor Authentication (MFA).
  - Password recovery: Forgot password, reset token verification, and in-app password changes.
  - OAuth integration routes for Google and GitHub single-sign-on.
  - Dynamic role redirection via `resolveRoleDashboardPath(role)`.

---

### B. Organization & Workforce Directory

- **Purpose**: Centralizes the enterprise organizational structure, reporting hierarchies, department rosters, and employee profiles.
- **Key Files**:
  - [app/admin/workforce/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/admin/workforce/page.tsx): Main workforce administrative workspace.
  - [lib/admin-workforce-store.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/admin-workforce-store.ts): Department and employee state stores.
  - [lib/org-chart-logic.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/org-chart-logic.ts): Tree-builder calculating managerial hierarchies and node spans.
- **Features Implemented**:
  - Interactive multi-level Organizational Chart with expandable team branches.
  - Add Employee Wizard capturing personal KYC, official credentials, compensation structure, and reporting manager.
  - Department creation with budget tracking, headcount limits, and theme configurations.
  - Real-time search and filter across employees by department, designation, and employment status.

---

### C. Talent Acquisition & ATS (23 Sub-Modules)

OFC360 includes an enterprise **23-submodule Applicant Tracking System (ATS)** located in [src/components/recruitment/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/recruitment/) and [src/services/recruitment/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/recruitment/):

```
recruitment/
├── dashboard              # 10 KPI cards, requisition status, pipeline velocity
├── requisitions           # Headcount planning, CTC budget, hiring manager approval
├── job-postings           # Multi-channel job posting board & external syndication
├── career-portal          # Public responsive career portal for candidates
├── candidates             # Centralized talent pool database with smart search
├── resume-screening       # AI resume parsing, skill matching, knockout criteria
├── pipeline               # Drag-and-drop Kanban hiring pipeline stages
├── assessments            # Technical tests, cognitive evaluations & scoring
├── interviews             # Scheduling calendar with video conferencing links
├── video-interviews       # Asynchronous one-way video interview reviews
├── scorecards             # Structured interview evaluations & competency rubrics
├── offers                 # Digital offer letter generation, compensation breakdown
├── bgv                    # Background check verification (Identity, Criminal, Past CTC)
├── onboarding-handoff     # 1-click candidate-to-employee data transfer
├── referrals              # Employee referral tracking & bonus disbursement
├── vendors                # Staffing agency portal, placement fees, vendor SLAs
├── communications         # Automated email triggers and candidate messaging
├── approvals              # Multi-level requisition and offer approval queues
├── reports                # Time-to-hire, source efficiency, cost-per-hire analytics
├── settings               # Hiring pipelines, assessment templates, email triggers
├── audit-logs             # Compliance logs of all candidate actions and stage moves
├── notifications          # In-app and email candidate alerts
└── hiring-manager         # Dedicated hiring manager review workspace
```

---

### D. Employee Onboarding (24 Sub-Modules)

Located in [src/components/onboarding/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/onboarding/) and [src/services/onboarding/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/onboarding/), this module handles the employee journey from pre-boarding through probation confirmation:

- **24 Sub-Modules Supported**:
  `dashboard`, `joiners`, `workflows`, `tasks`, `documents`, `joining-forms`, `offer-handoff`, `policies`, `it-assets`, `payroll-handoff`, `induction`, `training`, `buddy`, `day-one`, `probation`, `surveys`, `communications`, `approvals`, `reports`, `settings`, `audit-logs`, `notifications`, `manager-portal`, `joiner-portal`.
- **Highlights**:
  - **New Joiner Portal**: Clean, friction-free portal where joiners complete personal data, emergency contacts, and statutory declarations prior to Day 1.
  - **Task Checklist Engine**: Automated task assignment to IT (laptop provisioning), Facilities (desk/ID card), and HR (orientation).
  - **Probation Milestones**: 30-60-90 day performance review check-ins leading to formal probation confirmation or extension.

---

### E. Attendance, Geofencing & Biometric Time Tracking

```mermaid
flowchart LR
    A[Camera Capture Modal] -->|Snap Frame| B[Transient captureVault]
    B -->|Generate captureId| C[RTK Query Mutation]
    C -->|POST /api/v1/attendance/punch| D[Attendance Gateway]
    D -->|Validate Face & GPS| E[(Database / Mock)]
    C -.->|finally Cleanup| B
```

- **Purpose**: High-security, tamper-proof workforce attendance tracking combining facial recognition, GPS coordinates, and shift rosters.
- **Key Files**:
  - [src/features/attendance/attendanceApi.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/attendanceApi.ts): Implements **54 attendance endpoint operations** and 12 AI attendance monitoring operations.
  - [src/features/attendance/captureVault.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/captureVault.ts): **Transient Biometric Vault** ensuring raw face captures and GPS coordinates never pollute state.
  - [src/components/attendance/CameraCaptureModal.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/attendance/CameraCaptureModal.tsx): Live webcam canvas feed with face alignment guides.
- **Features Implemented**:
  - Biometric face check-in, check-out, break-start, and break-end.
  - Dual Geofencing verification comparing device GPS readings against configured office radii.
  - Attendance regularization requests for missed punches with manager approval workflows.
  - Real-time monthly calendar view highlighting present, absent, half-day, and weekend days.

---

### F. Holiday & Calendar Governance (22 Sub-Modules)

Located in [src/components/holidays/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/holidays/) and [src/services/holidays/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/holidays/):

- **22 Sub-Modules**:
  `dashboard`, `calendar-views`, `templates`, `master`, `assignment`, `optional-policy`, `weekly-off`, `special-overrides`, `swap-compoff`, `shift-site`, `holiday-work`, `leave-payroll-sync`, `optional-booking`, `approvals`, `communications`, `year-rollover`, `reports`, `settings`, `audit-logs`, `notifications`, `manager-portal`, `employee-portal`.
- **Capabilities**: Multi-location holiday calendars, floating/restricted holiday allocations, weekly off rules (e.g. 2nd/4th Saturday offs), and compensatory off (compoff) generation for holiday work.

---

### G. Enterprise Payroll & Statutory Engine (19 Sub-Modules)

```mermaid
flowchart TD
    P1[Pay Calendar Cycle Nov 2026] --> P2[Attendance & LOP Sync]
    P2 --> P3[Variable Pay & Bonuses]
    P3 --> P4[Salary Structure & CTC Breakup]
    P4 --> P5{Gross Pay Computed}
    P5 --> P6[Statutory Deductions: PF, ESI, PT, LWF]
    P5 --> P7[Income Tax TDS Projection]
    P5 --> P8[Loan EMI & Advance Deductions]
    P6 & P7 & P8 --> P9[Net Take-Home Pay]
    P9 --> P10[Two-Tier Approval Workflow]
    P10 --> P11[Bank NEFT Batch & Payslip Distribution]
```

- **Purpose**: End-to-end gross-to-net salary computation, statutory compliance management, loan servicing, and payslip generation.
- **Key Files**:
  - [src/components/payroll/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/payroll/): Comprehensive workspace shell with 5 modular suites.
  - [src/services/payroll/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/payroll/): Typed client SDK handling all payroll REST operations.
- **19 Sub-Modules**:
  `dashboard`, `pay-calendar`, `salary-structures`, `compensation`, `attendance-lop`, `variable-inputs`, `loans-advances`, `statutory`, `tax-declarations`, `approvals`, `payslips`, `bank-disbursement`, `fnf-settlement`, `arrears`, `reports`, `settings`, `audit-logs`, `notifications`, `my-pay`.
- **Statutory Engines**:
  - **Provident Fund (PF)**: 12% employee + 12% employer contribution with statutory EPS/EPFO capping.
  - **Employee State Insurance (ESI)**: 0.75% employee + 3.25% employer calculations for eligible wage thresholds.
  - **Professional Tax (PT)**: State-specific slabs across Indian jurisdictions.
  - **TDS & Old/New Tax Regime**: Annualized tax projections with exemption deductions under 80C, 80D, and HRA.

---

### H. Performance Management, OKRs & 360 Feedback

Located in [src/components/performance/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/performance/) and [src/services/performance/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/performance/):

- **Goals & OKRs**: Individual, Team, Departmental, and Company-level objectives with quantitative key results and progress tracking.
- **Review Cycles**: Automated quarterly and annual review cycles with distinct review stages: Self-Assessment, Manager Evaluation, HR Calibration, and Executive Sign-off.
- **360-Degree Feedback**: Anonymous or named peer, subordinate, and cross-functional feedback gathering.
- **Performance Improvement Plans (PIP)**: Structured remedial tracks with dedicated mentors, milestones, and formal outcome tracking.

---

### I. Employee Self-Service (ESS) & My Dashboard

Located in [app/employee/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/employee/page.tsx) and [src/services/employee-dashboard/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/employee-dashboard/):

- **Personal Daily Digest**: Displays current shift details, active attendance punch timer, remaining annual leave quotas, and upcoming holidays.
- **My Pay**: Direct access to past payslips with interactive earnings/deductions breakdown and Form 16 downloads.
- **Quick Action Triggers**: Instant one-click request buttons for applying for leave, requesting attendance regularizations, claiming expenses, and raising helpdesk tickets.

---

### J. Approvals, Rosters & Announcements

Located in [src/screens/ApprovalsScreen.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/screens/ApprovalsScreen.tsx) and [src/screens/ShiftsAndRostersScreen.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/screens/ShiftsAndRostersScreen.tsx):

- **Centralized Approvals Queue**: Consolidates leave requests, shift swap requests, expense reimbursements, and attendance regularizations into a single triage list.
- **Shift & Roster Planner**: Visual weekly scheduler supporting Morning Shift (MS), General Shift (GS), Night Shift (NS), Flexi Shift (FLX), and Weekly Off (OFF).
- **Company Announcements**: Rich-text announcement broadcasts with target audience filtering and push notifications.

---

### K. HR & Payroll Analytics Intelligence

- **Workforce Analytics**: Attrition rates, hiring velocity, gender diversity ratios, and department headcount distributions.
- **Attendance Analytics**: Punctuality indices, Bradford factor scoring for absenteeism, overtime trends, and device health monitoring.
- **Payroll Analytics**: Monthly variance audits, total payroll burn rate, employer contribution totals, and automated anomaly flagging.

---

### L. Asset Management (Procurement to Retirement — 25 Sub-Modules)

Located in [src/components/assets/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/components/assets/) and [src/services/assets/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/assets/):

- **25 Sub-Modules**:
  `dashboard`, `register`, `categories`, `procurement`, `vendors`, `allocation`, `requests`, `lifecycle-integration`, `maintenance`, `warranty`, `licenses`, `depreciation`, `transfers`, `physical-audit`, `loss-disposal`, `consumables`, `locations`, `qr-barcode`, `approvals`, `reports`, `settings`, `audit-logs`, `notifications`, `manager-portal`, `employee-portal`.
- **Capabilities**: Complete hardware tracking, depreciation calculation (Straight Line / WDV), software license allocation, vendor warranty management, and asset de-allocation handoffs during employee exit.

---

### M. Document Vault, OCR & Expiry Governance

Located in [app/documents/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/documents/page.tsx) and [src/services/employee-documents/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/employee-documents/):

- **8 Document Categories**: Identity (Passport/Aadhaar), Address Proof, Education, Previous Employment, Joining Kit, Payroll/Tax, Performance, and Exit Clearance.
- **Verification Workflow**: Verification states (`Pending`, `Under Review`, `Verified`, `Rejected`, `Resubmission Required`).
- **Expiry Tracking**: Proactive alerts for documents expiring in 60, 30, 15, or 7 days (e.g. Work Visas, Passports).
- **Security Tiers**: Role-based confidentiality levels from `Public Internal` to `Strictly Restricted (PII)`.

---

### N. Travel Desk, Itinerary Booking & Expense Claims

Located in [app/travel/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/travel/page.tsx) and [src/services/travel-desk/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/travel-desk/):

- **Multi-City Travel Requests**: Domestic and international itineraries with class eligibility enforcement based on employee designation.
- **Booking Desk**: Corporate vendor bookings for flights, trains, hotels, and cabs with PNR and voucher uploads.
- **Expense Claim Settlement**: Integrated receipt submission, currency conversions, travel advance adjustments, and manager approval workflows.

---

### O. Visitor Security & Material Pass (24 Sub-Modules)

Located in [app/visitors/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/visitors/page.tsx) and [src/services/visitors/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/visitors/):

- **24 Sub-Modules**:
  `dashboard`, `pre-registration`, `walk-in`, `kiosk`, `passes`, `reception-desk`, `host-approvals`, `visitor-types`, `watchlist`, `documents-nda`, `vehicles-parking`, `contractors-deliveries`, `area-access`, `material-gate-pass`, `health-safety`, `evacuation`, `communications`, `approvals`, `reports`, `settings`, `audit-logs`, `notifications`, `host-portal`, `visitor-portal`.
- **Security Features**: QR-coded visitor badges, instant host SMS/Email notifications upon arrival, watchlist security checks, NDA digital sign-offs, and Returnable/Non-Returnable Material Gate Passes.

---

### P. Helpdesk, SLA Escalation & Confidential Whistleblower Portal

Located in [app/helpdesk/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/helpdesk/page.tsx) and [components/helpdesk/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/components/helpdesk/):

- **Ticketing Engine**: Multi-category support (HR, Payroll, IT, Attendance, Leave) with live SLA countdown timers and priority tiers.
- **Confidential Complaints (POSH & Whistleblower)**: Specialized secure channel with anonymous submission support, restricted investigator access (Super Admin & HR Admin only), evidence lockers, and committee investigation logs.
- **SLA Escalation Engine**: Automated multi-tier escalations (Lead -> Head of HR -> Executive) upon response target breach.
- **Knowledge Base (KB)**: Searchable self-service repository of company policies, FAQs, and guides.

---

### Q. Enterprise Company Settings & Security Policy

Located in [app/settings/page.tsx](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app/settings/page.tsx) and [src/services/settingsApi.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/settingsApi.ts):

- **Global Policy Configuration**: Attendance late-mark grace periods, overtime calculation thresholds, geo-fence radius limits, and mandatory MFA enforcement.
- **Branding & Legal Entities**: Multi-entity company registration, corporate logo branding, and fiscal year calendar controls.

---

# 6. System Architecture — Complete Explanation

### Architectural Pattern: Dual-Mode Enterprise Client

OFC360 employs a **Dual-Mode Enterprise Architecture**:

```mermaid
flowchart TB
    subgraph CLIENT_LAYER["1. OFC360 Client Tier (Web + Mobile)"]
        Browser[Next.js 15 Web Application]
        MobileApp[Expo SDK 52 React Native App]
        PWA[Progressive Web App Shell]
    end

    subgraph STATE_LAYER["2. State & Data Layer"]
        ReduxStore[Redux Toolkit Store makeHrStore]
        RTKQuery[RTK Query API Slices]
        Vault[Transient Biometric Vault captureVault.ts]
        ReactQuery[TanStack React Query Cache]
    end

    subgraph TRANSPORT_LAYER["3. Transport & Delegation Layer"]
        Transport[Authenticated HTTP Transport transport.ts]
        Coalesce[Refresh Coalescer & AuthClient]
    end

    subgraph EXECUTION_MODE{"4. API Target Evaluation"}
        ModeCheck{Is NEXT_PUBLIC_API_URL set?}
    end

    subgraph LOCAL_MODE["5A. Zero-Backend Local Mode"]
        MockEngine[localMockFetch local-mock-engine.ts]
        LocalStorage[(Browser LocalStorage & In-Memory Stores)]
    end

    subgraph REMOTE_MODE["5B. Live Enterprise Backend"]
        FastAPI[Python FastAPI REST Gateway]
        AuthSvc[JWT Auth & RBAC Service]
        CeleryWorker[Celery Background Task Workers]
        PostgresDB[(PostgreSQL Relational DB)]
        GeminiAPI[Google Gemini AI Engine]
    end

    CLIENT_LAYER --> STATE_LAYER
    STATE_LAYER --> TRANSPORT_LAYER
    TRANSPORT_LAYER --> EXECUTION_MODE
    EXECUTION_MODE -->|No / Empty String| LOCAL_MODE
    EXECUTION_MODE -->|Configured Origin| REMOTE_MODE
```

### End-to-End Request & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / HR Admin
    participant View as React UI Component
    participant Store as Redux Toolkit Slice
    participant API as RTK Query / Service Client
    participant Trans as Transport Adapter
    participant Mock as Local Mock Engine
    participant Remote as FastAPI Backend (api.ofc360.com)

    User->>View: Interacts with UI (e.g., Submits Regularization)
    View->>API: Triggers Mutation (regularizeAttendance)
    API->>Trans: executeAttendanceRequest(config)
    Trans->>Trans: Attach Bearer Access Token
    alt Mode: Standalone Local Persistence
        Trans->>Mock: localMockFetch(url, init)
        Mock->>Mock: Update in-memory state & localStorage
        Mock-->>Trans: 200 OK Response Envelope
    else Mode: Remote Live Backend
        Trans->>Remote: fetch(https://api.ofc360.com/api/v1/...)
        Remote-->>Trans: 200 OK Response Envelope
    end
    Trans-->>API: Unwrapped typed payload
    API->>Store: Invalidate cache tags (Dashboard, Approvals)
    Store-->>View: Re-render updated UI with confirmation toast
```

---

# 7. Frontend Architecture

### App Router Structure & Navigation Tree

The Next.js 15 App Router directory tree in `vinitapp/app` consists of **41 pages and route handlers**:

```
vinitapp/app/
├── globals.css                       # Global Tailwind CSS styles and theme variables
├── layout.tsx                        # Root HTML layout with Inter font and metadata
├── manifest.ts                       # PWA web manifest specification
├── not-found.tsx                     # Global 404 page
├── page.tsx                          # Root landing page (renders App shell)
├── activate/page.tsx                 # Account activation
├── admin/workforce/page.tsx          # Workforce directory & organization tree
├── assets/                           # Asset management
│   ├── page.tsx
│   └── [module]/page.tsx             # Dynamic asset sub-modules
├── attendance-analytics/             # Attendance insights
│   ├── page.tsx
│   └── [module]/page.tsx
├── auth/callback/route.ts            # OAuth callback handler
├── change-password/page.tsx          # Authenticated password update
├── dashboard/                        # Central dashboard hub
│   ├── page.tsx
│   ├── forbidden/page.tsx            # Access Denied view
│   └── [role]/page.tsx               # Persona portal router
├── documents/page.tsx                # Document repository & OCR
├── employee/page.tsx                 # Employee Self-Service (ESS)
├── executive/page.tsx                # Executive Command Center
├── forgot-password/page.tsx          # Password recovery initiation
├── helpdesk/                         # Helpdesk & Service Desk
│   ├── page.tsx
│   ├── [section]/page.tsx
│   └── tickets/[id]/page.tsx         # Detailed ticket conversation
├── holidays/                         # Holiday governance
│   ├── page.tsx
│   └── [module]/page.tsx
├── it-admin/page.tsx                 # IT security & asset console
├── login/page.tsx                    # Multi-persona login
├── manager/page.tsx                  # Team manager workspace
├── mfa-verify/page.tsx               # Two-factor authentication
├── my-dashboard/page.tsx             # Personal employee dashboard
├── onboarding/                       # Onboarding suite
│   ├── page.tsx
│   └── [module]/page.tsx
├── payroll/                          # Payroll engine
│   ├── page.tsx
│   └── [module]/page.tsx
├── payroll-analytics/page.tsx        # Payroll audit intelligence
├── performance/page.tsx              # Goals, reviews & OKRs
├── recruitment/                      # Talent acquisition suite
│   ├── page.tsx
│   └── [module]/page.tsx
├── register/page.tsx                 # Enterprise user registration
├── reset-password/page.tsx           # Password reset with token
├── settings/page.tsx                 # Company settings
├── travel/page.tsx                   # Travel desk & expenses
├── verify-email/page.tsx             # Email link verification
├── verify-otp/page.tsx               # 6-digit SMS OTP verification
└── visitors/                         # Visitor security
    ├── page.tsx
    └── [module]/page.tsx
```

---

### State Management & Redux Store

Configured via `makeHrStore()` in [lib/store/index.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/index.ts):

- **Redux Slices**:
  - `hrMobileUi`: Governs active bottom navigation tabs, home tabs, active sub-modules, dark mode, toast alerts, and modal sheets.
  - `adminDepartments`: Manages local department directory and budget metrics.
  - `adminEmployees`: Manages local employee roster records.
  - `attendanceUi`: Manages attendance punch status, transient capture IDs, and calendar filters.
- **RTK Query APIs**:
  - `hrDashboardApi` ([lib/store/hr-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/hr-api.ts)): Manages workforce rosters, shifts, holidays, approvals, announcements, and payroll summaries.
  - `helpDeskApi` ([lib/store/helpdesk-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/helpdesk-api.ts)): Manages tickets, conversations, complaints, KB articles, and SLA rules.
  - `payrollAnalyticsApi` ([lib/store/payroll-analytics-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/store/payroll-analytics-api.ts)): Manages payroll KPIs, anomaly status, and compliance filings.
  - `attendanceApi` ([src/features/attendance/attendanceApi.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/attendanceApi.ts)): Manages 54 attendance endpoints, biometric liveness validation, and AI monitor alerts.

---

### UI Component Hierarchy: WorkspaceShells & Primitives

All major modules in `src/components/` adhere to a clean 3-layer architecture:
1. **WorkspaceShell (`<Module>WorkspaceShell.tsx`)**: Controls sub-module tab bars, global search inputs, export triggers, and responsive layout wraps.
2. **Primitives (`<Module>Primitives.tsx`)**: Reusable UI atoms including KPI cards, status badges, metric formatters, and dialog containers.
3. **Domain Bundles**: 3 to 4 specialized files encapsulating sub-module logic (e.g. `PayrollCoreModules.tsx`, `PayrollComplianceAndOpsModules.tsx`, `PayrollGovernanceAndEssModules.tsx`).

---

# 8. Backend Architecture & API Contracts

### API Contract Specifications (`docs/*.md`)

The repository includes complete REST API contracts detailing endpoints, request payloads, response envelopes, RBAC rules, and error codes:

| Contract File | Covered Domain | Key Endpoints | RBAC Roles Enforced |
| :--- | :--- | :--- | :--- |
| [recruitment-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/recruitment-api-contract.md) | ATS & Hiring | `/api/v1/recruitment/*` (23 endpoints) | `super_admin`, `hr_admin`, `recruiter`, `hiring_manager`, `interviewer`, `approver`, `candidate` |
| [onboarding-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/onboarding-api-contract.md) | Onboarding & Probation | `/api/v1/onboarding/*` (24 endpoints) | `super_admin`, `hr_admin`, `hr_executive`, `reporting_manager`, `it_admin`, `new_joiner` |
| [payroll-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/payroll-api-contract.md) | Payroll & Compliance | `/api/v1/payroll/*` (19 endpoints) | `super_admin`, `hr_admin`, `payroll_officer`, `finance_admin`, `employee` |
| [attendance-analytics-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/attendance-analytics-api-contract.md) | Attendance Analytics | `/api/v1/attendance-analytics/*` | `super_admin`, `hr_admin`, `attendance_admin`, `department_head`, `reporting_manager`, `payroll` |
| [assets-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/assets-api-contract.md) | IT & Facility Assets | `/api/v1/assets/*` (25 endpoints) | `super_admin`, `asset_admin`, `it_admin`, `facilities_admin`, `finance`, `procurement` |
| [visitors-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/visitors-api-contract.md) | Visitor Security | `/api/v1/visitors/*` (24 endpoints) | `super_admin`, `admin_facilities`, `security_reception`, `security_supervisor`, `host_employee` |
| [holidays-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/holidays-api-contract.md) | Holidays & Swaps | `/api/v1/holidays/*` (22 endpoints) | `super_admin`, `hr_admin`, `hr_executive`, `regional_hr`, `reporting_manager`, `employee` |
| [employee-dashboard-api-contract.md](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/docs/employee-dashboard-api-contract.md) | ESS Gateway | `/api/v1/employee-dashboard/*` | Strictly scoped to authenticated employee (`req.user.id`) |

---

### Local Mock & Persistence Engine (`local-mock-engine.ts`)

Located in [src/services/local-mock-engine.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/local-mock-engine.ts) (2,638 lines):
- **Universal Mock Interceptor**: Implements `localMockFetch: typeof fetch`, intercepting all standard `/api/v1/*` HTTP calls when operating in standalone mode.
- **Deterministic Persona Generation**: Authenticating with demo emails automatically assigns corresponding roles (e.g., `aarav.sharma@ofc360.com` -> `hr_admin`, `ceo@ofc360.com` -> `executive`, `emp@ofc360.com` -> `employee`).
- **Browser LocalStorage Backing**: Mutations write directly to local JSON stores (`STORAGE_KEYS`), persisting shifts, approvals, tickets, and employees across browser refreshes.

---

# 9. Database Architecture & Entity Relationship (ER) Model

### Enterprise ER Diagram

The following diagram models the confirmed data entities and relationships implemented across TypeScript schemas and API contracts:

```mermaid
erDiagram
    ORGANIZATION ||--o{ DEPARTMENT : contains
    ORGANIZATION ||--o{ USER : employs
    DEPARTMENT ||--o{ EMPLOYEE : assigns
    USER ||--|| EMPLOYEE : profile

    EMPLOYEE ||--o{ ATTENDANCE_RECORD : logs
    EMPLOYEE ||--o{ LEAVE_REQUEST : submits
    EMPLOYEE ||--o{ PERFORMANCE_GOAL : owns
    EMPLOYEE ||--o{ ASSET_ALLOCATION : receives
    EMPLOYEE ||--o{ EXPENSE_CLAIM : files
    EMPLOYEE ||--o{ PAYSLIP : receives

    SHIFT ||--o{ ROSTER_ENTRY : defines
    EMPLOYEE ||--o{ ROSTER_ENTRY : assigned_to

    JOB_REQUISITION ||--o{ JOB_POSTING : publishes
    JOB_POSTING ||--o{ CANDIDATE_APPLICATION : receives
    CANDIDATE ||--o{ CANDIDATE_APPLICATION : submits
    CANDIDATE_APPLICATION ||--o{ INTERVIEW : schedules
    CANDIDATE_APPLICATION ||--o{ OFFER_LETTER : issues
    OFFER_LETTER ||--|| ONBOARDING_JOINER : initiates

    PAYROLL_CYCLE ||--o{ PAYROLL_RUN : executes
    PAYROLL_RUN ||--o{ PAYSLIP : generates
    SALARY_STRUCTURE ||--o{ EMPLOYEE_COMPENSATION : configures
    EMPLOYEE ||--|| EMPLOYEE_COMPENSATION : receives

    SUPPORT_TICKET ||--o{ TICKET_MESSAGE : contains
    EMPLOYEE ||--o{ SUPPORT_TICKET : creates
    EMPLOYEE ||--o{ CONFIDENTIAL_COMPLAINT : files

    ORGANIZATION {
        string id PK
        string name
        string domain
        string currency
        string timezone
    }

    USER {
        string id PK
        string email UK
        string role
        boolean is_active
        boolean email_verified
    }

    EMPLOYEE {
        string id PK
        string employee_code UK
        string full_name
        string official_email
        string department_id FK
        string designation
        string reporting_manager_id FK
        date date_of_joining
        string employment_status
    }

    ATTENDANCE_RECORD {
        string id PK
        string employee_id FK
        date punch_date
        time check_in
        time check_out
        float work_hours
        string status
        boolean geofence_verified
    }

    PAYROLL_RUN {
        string id PK
        string cycle_id FK
        date pay_date
        float total_gross
        float total_net
        float statutory_deductions
        string status
    }

    PAYSLIP {
        string id PK
        string payroll_run_id FK
        string employee_id FK
        float gross_earnings
        float net_pay
        float pf_deduction
        float esi_deduction
        float tds_deduction
    }

    SUPPORT_TICKET {
        string id PK
        string ticket_number UK
        string employee_id FK
        string category
        string priority
        string status
        string sla_status
    }
```

---

# 10. Authentication, Security & Biometric Privacy

### JWT Session Lifecycle & Refresh Coalescing

1. **Token Storage**: The access token is held in-memory within the singleton `authClient` ([lib/auth-api.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/auth-api.ts)).
2. **Refresh Coalescing**: When multiple parallel requests receive a `401 Unauthorized`, `coalescedRefresh()` in [src/features/attendance/transport.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/transport.ts#L83-L97) merges concurrent refresh attempts into a single in-flight network promise, preventing token race conditions.
3. **Safe Retries**: Only idempotent read requests (`GET`) are automatically retried post-refresh; write mutations (`POST`, `PUT`, `DELETE`) are flagged as `isUncertainWrite: true` to prevent duplicate writes.

---

### Biometric & Coordinate Transient Vault (`captureVault.ts`)

OFC360 implements strict biometric hygiene via [src/features/attendance/captureVault.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/features/attendance/captureVault.ts):
- **Zero-Pollution Guarantee**: Raw base64 webcam frames, binary blobs, and high-precision GPS coordinates **never enter Redux state, Redux DevTools, localStorage, or console logs**.
- **Opaque Token Lifecycle**: The capture modal stores the live capture in a memory `Map` and returns an ephemeral `captureId`. The RTK Query mutation consumes the image during HTTP transmission and immediately purges it in a `finally` block.
- **TTL Eviction**: Unconsumed captures automatically expire and are purged after 2 minutes.

---

# 11. API Architecture & Endpoint Inventory

### API Base Prefixes

All OFC360 API endpoints adhere to standardized versioned prefixes:
- `/api/v1/auth`: Identity, sessions, password lifecycle, MFA.
- `/api/v1/hr`: Workforce directories, departments, shifts, rosters, announcements.
- `/api/v1/attendance`: Check-in, check-out, face biometric verification, GPS geofencing, regularization.
- `/api/v1/payroll`: Salary structures, compensation, pay cycles, statutory reports, payslips.
- `/api/v1/recruitment`: Job requisitions, ATS pipelines, candidate screening, interviews, offers.
- `/api/v1/onboarding`: Joiner tasks, document collection, induction, probation milestones.
- `/api/v1/assets`: Hardware registers, licensing, maintenance, allocations, and returns.
- `/api/v1/holidays`: Holiday calendars, floating holiday bookings, compensatory off swaps.
- `/api/v1/visitors`: Visitor pre-registration, kiosk passes, watchlist checks, gate passes.
- `/api/v1/employee-dashboard`: Unified personal data gateway for Employee Self-Service.

---

### Comprehensive Endpoint Reference Table

<details>
<summary><strong>Click to view full module-wise API inventory</strong></summary>

| Module | Method | Endpoint Path | Function & Purpose | Authorized Roles |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticates credentials; issues JWT access token | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Registers enterprise user and company workspace | Public |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revokes current session tokens | Authenticated |
| **Auth** | `POST` | `/api/v1/auth/mfa/verify` | Validates MFA one-time passcode | Public |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Sends password reset email link | Public |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Resets password using secure token | Public |
| **HR** | `GET` | `/api/v1/hr/dashboard` | Retrieves consolidated HR dashboard KPIs & rosters | `hr_admin`, `super_admin` |
| **HR** | `POST` | `/api/v1/hr/approvals/action` | Approves or rejects a pending request | `hr_admin`, `manager`, `super_admin` |
| **HR** | `POST` | `/api/v1/hr/shifts` | Creates or updates a shift schedule | `hr_admin`, `super_admin` |
| **HR** | `POST` | `/api/v1/hr/rosters/assign` | Assigns weekly shift codes to employees | `hr_admin`, `manager` |
| **HR** | `GET` | `/api/v1/hr/admin-departments` | Retrieves all departments & headcount stats | `hr_admin`, `super_admin` |
| **HR** | `POST` | `/api/v1/hr/admin-departments` | Creates a new organization department | `hr_admin`, `super_admin` |
| **HR** | `GET` | `/api/v1/hr/admin-employees` | Retrieves active workforce employee directory | `hr_admin`, `super_admin` |
| **HR** | `POST` | `/api/v1/hr/admin-employees` | Adds a new employee to the organization | `hr_admin`, `super_admin` |
| **Attendance** | `POST` | `/api/v1/attendance/punch` | Records check-in / check-out with face & GPS | All Employees |
| **Attendance** | `POST` | `/api/v1/attendance/break/start` | Initiates tracked break session | All Employees |
| **Attendance** | `POST` | `/api/v1/attendance/break/end` | Concludes active break session | All Employees |
| **Attendance** | `POST` | `/api/v1/attendance/regularize` | Submits attendance regularization request | All Employees |
| **Attendance** | `GET` | `/api/v1/attendance/face/me` | Fetches personal attendance punch state | All Employees |
| **Attendance** | `GET` | `/api/v1/attendance/calendar` | Monthly attendance status calendar | All Employees |
| **Payroll** | `GET` | `/api/v1/payroll/dashboard/summary` | Payroll KPIs, gross pay, net pay, headcount | `hr_admin`, `super_admin`, `payroll` |
| **Payroll** | `POST` | `/api/v1/payroll/runs/execute` | Executes automated monthly salary run | `hr_admin`, `super_admin` |
| **Payroll** | `GET` | `/api/v1/payroll/statutory/overview` | PF, ESI, PT, and TDS statutory summary | `hr_admin`, `super_admin`, `payroll` |
| **Payroll** | `POST` | `/api/v1/payroll/disbursement/generate-batch` | Generates bank NEFT disbursement batch file | `hr_admin`, `super_admin` |
| **Payroll** | `POST` | `/api/v1/payroll/fnf/calculate` | Computes Full & Final settlement for exit | `hr_admin`, `super_admin` |
| **Recruitment** | `GET` | `/api/v1/recruitment/dashboard/summary` | ATS metrics: time-to-hire, active requisitions | `hr_admin`, `recruiter`, `super_admin` |
| **Recruitment** | `POST` | `/api/v1/recruitment/requisitions` | Submits new job hiring requisition | `hr_admin`, `hiring_manager` |
| **Recruitment** | `POST` | `/api/v1/recruitment/candidates/parse` | AI resume parser & candidate extraction | `hr_admin`, `recruiter` |
| **Recruitment** | `POST` | `/api/v1/recruitment/offers/generate` | Generates official candidate offer letter | `hr_admin`, `super_admin` |
| **Onboarding** | `GET` | `/api/v1/onboarding/dashboard/summary` | Active joiners pipeline & task progress | `hr_admin`, `super_admin` |
| **Onboarding** | `POST` | `/api/v1/onboarding/tasks/complete` | Marks pre-boarding checklist task complete | `hr_admin`, `it_admin`, `new_joiner` |
| **Assets** | `GET` | `/api/v1/assets/dashboard/summary` | Asset distribution, warranties, repair count | `it_admin`, `facilities_admin`, `hr_admin` |
| **Assets** | `POST` | `/api/v1/assets/allocate` | Allocates hardware asset to employee | `it_admin`, `facilities_admin` |
| **Visitors** | `POST` | `/api/v1/visitors/pre-register` | Pre-registers guest or contractor visit | All Employees |
| **Visitors** | `POST` | `/api/v1/visitors/kiosk/check-in` | Self-service visitor badge check-in | Security, Reception |
| **Helpdesk** | `GET` | `/api/v1/hr/helpdesk` | Lists all support tickets & complaints | All Personas |
| **Helpdesk** | `POST` | `/api/v1/hr/helpdesk/tickets` | Creates a new employee support ticket | All Personas |
| **Helpdesk** | `POST` | `/api/v1/hr/helpdesk/complaints` | Submits confidential harassment / POSH claim | All Employees (Anonymous allowed) |

</details>

---

# 12. How OFC360 Works — Real Business Workflows

### Workflow 1: Hiring & Onboarding an Employee

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    actor Candidate
    actor Manager
    actor HR as HR Admin
    actor IT as IT Admin
    participant ATS as Recruitment Module
    participant ONB as Onboarding Module
    participant DIR as Workforce Directory

    Recruiter->>ATS: Create Requisition & Publish Job Posting
    Candidate->>ATS: Submit Application on Career Portal
    ATS->>ATS: AI Resume Parsing & Candidate Scoring
    Recruiter->>ATS: Schedule Interview
    Manager->>ATS: Submit Interview Scorecard (Recommend Hire)
    HR->>ATS: Generate Digital Offer Letter
    Candidate->>ATS: Accept Offer & E-Sign
    ATS->>ONB: 1-Click Handoff to Onboarding (Joiner Record Created)
    Candidate->>ONB: Upload Identity KYC (Aadhaar/PAN/Bank)
    HR->>ONB: Verify Documents
    ONB->>IT: Trigger Automated Laptop & Email Task
    IT->>ONB: Mark Asset Allocated & Email Created
    HR->>DIR: Finalize Day-1 Onboarding
    DIR-->>DIR: Create Active Employee Record & Org Chart Node
```

- **Trigger**: New headcount approval.
- **Frontend Routes**: `/recruitment/requisitions` -> `/recruitment/candidates` -> `/recruitment/offers` -> `/onboarding/joiner-portal` -> `/admin/workforce`.
- **Result**: Fully provisioned employee ready for Day-1 attendance.

---

### Workflow 2: Daily Biometric Attendance Punch with Geofencing

- **Trigger**: Employee arrives at office or begins remote work shift.
- **Actors**: Employee, Attendance System.
- **Step-by-step**:
  1. Employee navigates to Attendance screen and taps **"Check In"**.
  2. Browser prompts for Camera and Geolocation permissions.
  3. `CameraCaptureModal.tsx` activates webcam feed, detects face positioning, and captures frame.
  4. Geolocation API fetches latitude, longitude, and accuracy radius.
  5. `captureVault.ts` stores raw image and GPS reading, returning transient `captureId`.
  6. `attendanceApi.punch` submits request with `captureId` to `/api/v1/attendance/punch`.
  7. Backend verifies facial feature vector against enrolled employee template and confirms GPS coordinates fall within company geofence radius.
  8. Punch timestamp is saved; `captureVault` purges raw image bytes.
  9. Redux store updates active work timer; dashboard displays "Present" badge.

---

### Workflow 3: Monthly Payroll Processing & F&F Settlement

```mermaid
flowchart TD
    Step1[1. Select Pay Cycle: Nov 2026] --> Step2[2. Sync Attendance & LOP Days]
    Step2 --> Step3[3. Import Variable Inputs & Bonuses]
    Step3 --> Step4[4. Auto-Compute PF, ESI, PT, and TDS]
    Step4 --> Step5[5. Review Variance vs Previous Month]
    Step5 --> Step6{Variance > 5%?}
    Step6 -->|Yes| Step7[Investigate Anomaly in Payroll Analytics]
    Step6 -->|No| Step8[Submit for Dual HR & Finance Approval]
    Step7 --> Step8
    Step8 --> Step9[Generate Bank NEFT Batch File]
    Step9 --> Step10[Publish Digital Payslips to ESS]
```

- **Trigger**: Payroll cut-off date (25th of the month).
- **Frontend Routes**: `/payroll/pay-calendar` -> `/payroll/attendance-lop` -> `/payroll/approvals` -> `/payroll/payslips` -> `/payroll/bank-disbursement`.
- **Result**: Verified salaries credited to employee accounts; statutory reports ready for government filing.

---

# 13. AI & Automation Architecture

### Google Gemini API Integration

OFC360 integrates the **Google Gemini API** (`@google/genai` v2.4.0) configured via `GEMINI_API_KEY`:

```mermaid
flowchart LR
    Prompt[HR / Helpdesk Context] --> GeminiSDK[@google/genai SDK]
    GeminiSDK --> GeminiAPI[Gemini 1.5 / 2.0 Flash Endpoint]
    GeminiAPI --> Response[Structured JSON Response]
    Response --> UI[Draft Reply / Anomaly Insight]
```

- **AI Attendance Anomaly Monitoring**: Evaluates 12 attendance monitoring endpoints (`/api/v1/ai/attendance/*` and `/api/v1/ai-hub/attendance-monitor*`), flagging irregular punch patterns, excessive missing punches, and suspicious GPS radius clusters.
- **AI Resume Screening**: Parses unstructured PDF/Word CVs, extracts technical proficiencies, computes match percentages against job descriptions, and highlights knockout discrepancies.
- **AI Helpdesk Assistance**: Generates context-aware draft responses for support tickets and analyzes sentiment (Positive, Neutral, Frustrated, Urgent) in employee messages.

---

# 14. External Integrations

| Integration | Category | Configuration Key | High-Level Purpose | Codebase Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini API** | AI / LLM | `GEMINI_API_KEY` | Resume parsing, ticket smart replies, attendance anomaly analysis | [package.json](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/package.json#L13), [.env.example](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/.env.example#L4) |
| **Google OAuth 2.0** | Identity / SSO | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | One-click single sign-on authentication | [.env.example](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/.env.example#L12) |
| **GitHub OAuth** | Identity / SSO | `NEXT_PUBLIC_GITHUB_CLIENT_ID` | Developer and technical staff authentication | [.env.example](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/.env.example#L13) |
| **FastAPI Backend Gateway** | Core REST API | `NEXT_PUBLIC_API_URL` | Production upstream API gateway (`https://api.ofc360.com`) | [.env.example](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/.env.example#L9) |
| **Expo & Native Hardware** | Mobile PWA | Camera & GPS permissions | Hardware webcam face capture and geolocation coordinates | [app.json](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/app.json#L20-L24) |
| **Bank Batch File Format** | Banking / Finance | NA (Standardized TXT/CSV) | Exports automated salary transfer batches for corporate net-banking | [src/services/payroll/](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/src/services/payroll/) |

---

# 15. Project Folder Structure

```
c:\Users\Dell\OneDrive\Desktop\app\vinitapp
├── .env.example                      # Environment variables template
├── .eslintrc.json                    # ESLint rules
├── app.json                          # Expo SDK 52 mobile application configuration
├── App.tsx                           # Master cross-platform React application entry point
├── bun.lock                          # Bun package manager lockfile
├── mobile.package.json               # Expo / React Native package specification
├── next.config.ts                    # Next.js 15 build & routing configuration
├── package.json                      # Web application dependencies and npm scripts
├── tsconfig.json                     # TypeScript compiler configuration & path aliases
│
├── app/                              # Next.js 15 App Router pages (41 routes)
│   ├── activate/                     # User account activation
│   ├── admin/workforce/              # Workforce directory & organization tree
│   ├── assets/                       # Asset management workspace & [module] routes
│   ├── attendance-analytics/         # Attendance intelligence & [module] routes
│   ├── auth/callback/                # OAuth callback route handler
│   ├── change-password/              # Authenticated password reset
│   ├── dashboard/                    # Role-based dashboard hub & [role] router
│   ├── documents/                    # Document vault & verification
│   ├── employee/                     # Employee Self-Service (ESS)
│   ├── executive/                    # Executive Command Center
│   ├── helpdesk/                     # Service desk, tickets, and confidential complaints
│   ├── holidays/                     # Holiday calendar management & [module] routes
│   ├── it-admin/                     # IT security operations console
│   ├── login/                        # Multi-persona login portal
│   ├── manager/                      # Manager team workspace
│   ├── my-dashboard/                 # Employee personal digest
│   ├── onboarding/                   # Onboarding pipeline & [module] routes
│   ├── payroll/                      # Payroll processing engine & [module] routes
│   ├── payroll-analytics/            # Payroll cost variance & anomaly audit
│   ├── performance/                  # Goals, appraisals & 360 feedback
│   ├── recruitment/                  # Talent acquisition ATS & [module] routes
│   ├── register/                     # Enterprise registration
│   ├── reset-password/               # Token-based password reset
│   ├── settings/                     # Organization & security settings
│   ├── travel/                       # Travel desk & expense settlement
│   └── visitors/                     # Visitor management & [module] routes
│
├── components/                       # Shared UI components
│   ├── auth/                         # Forms: login, MFA, OTP, registration, route guards
│   ├── helpdesk/                     # Ticket views, SLA management, confidential POSH
│   ├── hr-mobile/                    # Mobile shell, org chart, rosters, holidays
│   ├── payroll-analytics/            # Variance graphs, department distributions
│   └── ui/                           # Button, Input, Label design atoms
│
├── docs/                             # Formal Enterprise REST API Contracts
│   ├── assets-api-contract.md
│   ├── attendance-analytics-api-contract.md
│   ├── employee-dashboard-api-contract.md
│   ├── holidays-api-contract.md
│   ├── onboarding-api-contract.md
│   ├── payroll-api-contract.md
│   ├── recruitment-api-contract.md
│   └── visitors-api-contract.md
│
├── lib/                              # Core enterprise logic, schemas & Redux store
│   ├── admin-workforce-store.ts      # Local department & employee stores
│   ├── auth-api.ts                   # Singleton auth client & token management
│   ├── auth-schemas.ts               # Zod validation schemas & role definitions
│   ├── employee-portal-logic.ts      # ESS calculations & state logic
│   ├── executive-portal-logic.ts     # C-Suite metrics & forecasting logic
│   ├── helpdesk-types.ts             # Ticketing, SLA, and complaint data types
│   ├── hr-dashboard-logic.ts         # Approvals, shifts, and roster state logic
│   ├── it-admin-portal-logic.ts      # Asset provisioning & security posture logic
│   ├── manager-portal-logic.ts       # Team reviews & approval routing logic
│   ├── org-chart-logic.ts            # Hierarchical organization tree generation
│   ├── payroll-analytics-types.ts    # Payroll variance & compliance alert types
│   ├── route-guards.ts               # Zero-trust role-based route guard engine
│   └── store/                        # Redux Toolkit configuration
│       ├── helpdesk-api.ts           # Helpdesk RTK Query slice
│       ├── hr-api.ts                 # Workforce & Rosters RTK Query slice
│       ├── index.ts                  # makeHrStore() store factory
│       └── payroll-analytics-api.ts  # Payroll analytics RTK Query slice
│
└── src/                              # Enterprise Workspace Modules & Typed Clients
    ├── components/                   # Specialized modular workspace suites
    │   ├── assets/                   # Asset WorkspaceShell, Primitives, 3 domain bundles
    │   ├── attendance/               # Camera capture webcam modal
    │   ├── attendance-analytics/     # Attendance Analytics WorkspaceShell & bundles
    │   ├── aurix/                    # Stepper and AI assistant components
    │   ├── documents/                # Document Vault WorkspaceShell & bundles
    │   ├── employee-dashboard/       # ESS personal dashboard widgets
    │   ├── holidays/                 # Holiday WorkspaceShell & bundles
    │   ├── linkedin/                 # LinkedIn-style top bar, bottom bar, navigation
    │   ├── onboarding/               # Onboarding WorkspaceShell & 3 domain bundles
    │   ├── payroll/                  # Payroll WorkspaceShell & 3 domain bundles
    │   ├── performance/              # Performance WorkspaceShell & role views
    │   ├── recruitment/              # Recruitment WorkspaceShell & 3 domain bundles
    │   ├── settings/                 # Settings WorkspaceShell
    │   ├── travel-desk/              # Travel Desk WorkspaceShell & role views
    │   └── visitors/                 # Visitor WorkspaceShell & 3 domain bundles
    │
    ├── features/attendance/          # Production Attendance & Biometrics Engine
    │   ├── attendanceApi.ts          # 54 attendance endpoints & 12 AI monitor operations
    │   ├── attendanceSlice.ts        # Punch state, timer & calendar UI slice
    │   ├── builders.ts               # Request payload builders & response normalizers
    │   ├── captureVault.ts           # Transient Biometric & GPS coordinate vault
    │   ├── transport.ts              # Authenticated HTTP adapter with refresh coalescing
    │   └── types.ts                  # Typed attendance models & error envelopes
    │
    ├── navigation/RootNavigator.tsx  # Mobile & PWA bottom navigation tab coordinator
    │
    ├── services/                     # Universal Typed REST Clients & Local Mock Engine
    │   ├── local-mock-engine.ts      # 2,638-line standalone zero-backend mock engine
    │   ├── assets/                   # Assets typed client SDK
    │   ├── attendance-analytics/     # Attendance analytics typed client SDK
    │   ├── employee-dashboard/       # ESS typed client SDK
    │   ├── employee-documents/       # Document vault typed client SDK
    │   ├── holidays/                 # Holidays typed client SDK
    │   ├── onboarding/               # Onboarding typed client SDK
    │   ├── payroll/                  # Payroll typed client SDK
    │   ├── performance/              # Performance typed client SDK
    │   ├── recruitment/              # Recruitment typed client SDK
    │   ├── travel-desk/              # Travel desk typed client SDK
    │   └── visitors/                 # Visitors typed client SDK
    │
    ├── theme/colors.ts               # Design palette (LinkedIn Navy, Action Blue, Slate)
    └── types/                        # TypeScript domain model definitions
```

---

# 16. Local Development & Setup Guide

### Prerequisites

Ensure you have the following installed on your development workstation:
- **Node.js**: `v20.x` or `v24.x` (LTS recommended; verified on Node v24.14.0)
- **Package Manager**: `npm` (v10+), `pnpm` (v9+), or `bun` (v1.2+)
- **Operating System**: Windows 10/11, macOS, or Linux

---

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/sharmavinit54538/vinitapp.git ofc360
cd ofc360/vinitapp
```

#### 2. Configure Environment Variables
Copy the template configuration file:
```bash
# On Linux/macOS
cp .env.example .env.local

# On Windows PowerShell
Copy-Item .env.example .env.local
```

Configure your environment settings:
```ini
# Leave NEXT_PUBLIC_API_URL empty to run in Zero-Backend Standalone Mode:
NEXT_PUBLIC_API_URL=""

# Or point to your live backend gateway:
# NEXT_PUBLIC_API_URL="https://api.ofc360.com"

# Optional Gemini AI API Key for AI features:
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional OAuth Client IDs:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_GITHUB_CLIENT_ID=""
```

#### 3. Install Dependencies
```bash
npm install
# Or if using Bun:
# bun install
```

#### 4. Run Next.js Web Application in Development Mode
```bash
npm run dev
```
The application will launch at **`http://localhost:3000`**.

#### 5. Demo Credentials (Zero-Backend Mode)
When running without an external backend, the local mock engine accepts any password with these demo emails:
- **HR Administrator**: `aarav.sharma@ofc360.com`
- **Employee (ESS)**: `emp@ofc360.com`
- **Team Manager**: `manager@ofc360.com`
- **Executive (CEO/CFO)**: `ceo@ofc360.com`
- **IT Administrator**: `it-admin@ofc360.com`
- **Super Administrator**: `super@ofc360.com`

#### 6. Run Mobile App via Expo (Optional)
To run the mobile shell on an Android/iOS emulator or physical device via Expo Go:
```bash
npx expo start
```
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Press `w` for Web view.

---

# 17. Deployment Architecture

```mermaid
flowchart TB
    DNS[DNS: app.ofc360.com] --> CDN[Cloudflare CDN / Edge Proxy]
    CDN --> NextServer[Next.js 15 Standalone Node Server / AWS ECS]
    NextServer -->|Static Assets| S3[AWS S3 / Edge Cache]
    NextServer -->|API Proxy / Direct| APIGateway[FastAPI Gateway: api.ofc360.com]
    APIGateway --> WorkerPool[Celery Task Workers & Redis]
    APIGateway --> RDS[(PostgreSQL Relational DB)]
    APIGateway --> GoogleAI[Google Gemini AI API]
```

- **Frontend Deployment**: Deployed as a standalone Node.js server container via Docker or serverless on Vercel / AWS ECS.
- **Environment Isolation**: Separate staging (`app-staging.ofc360.com`) and production (`app.ofc360.com`) environments pointing to respective API gateways.
- **PWA Capabilities**: Service worker caching and installable web manifest (`manifest.ts`) providing desktop and mobile app installation.

---

# 18. Testing & Quality Assurance

### Test Suite Inventory (26 Test Files)

The OFC360 repository includes **26 comprehensive unit and integration test files**:

```
lib/
├── auth.test.ts                       # Zod schemas, password strength, role mapping
├── employee-portal-logic.test.ts      # ESS metric calculations and widgets
├── executive-portal-logic.test.ts     # Retention velocity, executive calculations
├── helpdesk.test.ts                   # SLA timers, ticket filtering, complaint access
├── hr-dashboard-logic.test.ts         # Approval recomputation, roster swaps
├── icon-math.test.ts                  # Brand vector mathematics & canvas geometry
├── it-admin-portal-logic.test.ts      # IT asset allocation and posture checks
├── manager-portal-logic.test.ts       # Team review scoring & approval delegation
├── org-chart-logic.test.ts            # Org hierarchy spans & reporting lines
├── payroll-analytics.test.ts          # Variance audits & statutory calculation checks
└── route-guards.test.ts               # Role-based route access security

src/features/
├── admin/adminWorkforce.test.ts       # Department and employee store sync
└── attendance/attendance.test.ts      # Face capture vault, liveness & punch API

src/lib/
├── auth-bootstrap.test.ts             # Session bootstrapping & token restore
└── linkedin-ui-helpers.test.ts        # Navigation helpers & UI formatters

src/services/
├── assets/assets.test.ts              # Asset query building & error envelopes
├── attendance-analytics/attendanceAnalytics.test.ts # KPI calculations & metrics
├── employee-dashboard/employeeDashboard.test.ts     # ESS gateway endpoints
├── employee-documents/documentsEngine.test.ts       # Document verification states
├── holidays/holidays.test.ts          # Holiday conflict detection & compoff
├── onboarding/onboarding.test.ts      # Joiner task transitions & milestones
├── payroll/payroll.test.ts            # Gross-to-net pay & statutory deduction math
├── performance/performanceEngine.test.ts # Goal status & review cycle transitions
├── recruitment/recruitment.test.ts    # Requisition workflows & applicant scoring
├── travel-desk/travelDeskEngine.test.ts # Travel request status transitions
└── visitors/visitors.test.ts          # Visitor check-in & gate pass validation
```

### Running Tests
The test suite utilizes `node:test` and `node:assert/strict`. To execute tests:
```bash
# Ensure dependencies are installed first:
npm install

# Run tests using tsx:
npx tsx --test lib/*.test.ts
npx tsx --test src/services/**/*.test.ts
npx tsx --test src/features/attendance/*.test.ts
```

---

# 19. Feature Implementation Matrix

| Module | Frontend UI | Client SDK / RTK | Backend Contract | DB Models / Types | RBAC Guards | Unit Tests | Overall Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Authentication & Sessions** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Role-Based Routing** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Workforce Directory & Org Chart** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Attendance Biometrics & GPS** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Shifts & Rostering** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Attendance Analytics** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Holidays & Calendar** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Talent Acquisition (ATS)** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Employee Onboarding** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Payroll Processing** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Payroll Analytics** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Performance & OKRs** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Employee Self-Service (ESS)** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Manager Portal** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Executive Command Center** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **IT Admin Console** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Asset Management** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Document Vault & KYC** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Travel Desk & Expenses** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Visitor Security** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Helpdesk & POSH Complaints** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **Settings & Security Policy** | ✅ Implemented | ✅ Implemented | ✅ Defined | ✅ Typed | ✅ Enforced | ✅ Verified | **Complete** |
| **FastAPI Backend Services** | ⚠️ External | ⚠️ Mock Fallback | ✅ Defined | ⚠️ Remote | ⚠️ Remote | ⚠️ Remote | **External** |

---

# 20. Practical Troubleshooting Guide

### Common Issues & Verified Resolutions

#### 1. "Port 3000 is already in use"
Next.js will attempt to bind to port 3001 automatically. To explicitly terminate stale processes:
```powershell
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

#### 2. Resetting Local Mock Storage
If local demonstration data becomes corrupted in browser testing:
```javascript
// Open DevTools Console (F12) and run:
localStorage.clear();
location.reload();
```

#### 3. Camera / Geolocation Permissions Denied
- Facial attendance requires an HTTPS context or `localhost`.
- In Chrome: Click the padlock icon in the URL bar -> Ensure **Camera** and **Location** are set to **Allow**.

#### 4. Clearing Next.js Build Artifacts
If experiencing stale compilation issues:
```bash
npm run clean
npm run dev
```

---

# 21. Development Guidelines & Contribution Standards

- **Component Architecture**: Every new functional module must implement a `<Module>WorkspaceShell.tsx` and place sub-pages in a dedicated domain folder under `src/components/<module>/`.
- **API Isolation**: Never invoke `fetch()` directly in UI views. Route all HTTP operations through RTK Query slices in `lib/store/` or typed services in `src/services/<module>/`.
- **Zero PII Exposure**: Never store raw biometric images or GPS coordinates in Redux or persistent browser storage; always pass them through `src/features/attendance/captureVault.ts`.
- **Strict Role Guarantees**: Any new route must be registered in [lib/route-guards.ts](file:///c:/Users/Dell/OneDrive/Desktop/app/vinitapp/lib/route-guards.ts) with explicit role allowance rules.

---

# 22. Product Roadmap & Technical Gaps

### Implemented Capabilities
- Complete 41-page Next.js 15 App Router web application with full desktop and mobile responsive layouts.
- Cross-platform Expo SDK 52 mobile application shell with React Native Web support.
- 54-endpoint attendance engine with biometric webcam capture, geofencing, and transient coordinate vaults.
- Full 23-module ATS, 24-module Onboarding, 19-module Payroll, 25-module Asset, and 24-module Visitor suites.
- Complete standalone zero-backend mock engine (`local-mock-engine.ts`) with browser local storage persistence.
- 26 comprehensive unit test files validating schemas, calculations, state, and route guards.

### Known Technical Gaps & External Dependencies
- **Backend Infrastructure**: The Python FastAPI, PostgreSQL, and Celery backend services run externally. In production, configure `NEXT_PUBLIC_API_URL` to point to the live API gateway.
- **Test Execution Prerequisite**: Running the test suite locally requires installing dependencies (`npm install`) to resolve `@/` TypeScript module path aliases.

---

<p align="center">
  <strong>OFC360 Enterprise HRMS & Workforce Management Platform</strong><br/>
  <em>Built with Next.js 15, React 19, Redux Toolkit, Tailwind CSS v4, and Expo.</em>
</p>
