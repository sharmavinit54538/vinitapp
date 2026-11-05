import React from 'react';
import { HelpDeskApp } from '@/components/helpdesk/helpdesk-app';
import { HelpDeskNavId } from '@/lib/helpdesk-types';

const SECTION_MAP: Record<string, HelpDeskNavId> = {
  'overview': 'overview',
  'all-tickets': 'all_tickets',
  'my-assigned': 'my_assigned',
  'employee-requests': 'employee_requests',
  'complaints': 'complaints',
  'escalations': 'escalations',
  'sla-management': 'sla_management',
  'agent-management': 'agent_management',
  'categories': 'categories',
  'knowledge-base': 'knowledge_base',
  'faq-management': 'faq_management',
  'announcements': 'announcements',
  'reports-analytics': 'reports_analytics',
  'settings': 'settings',
};

export default async function HelpDeskSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const resolved = await params;
  const navId: HelpDeskNavId = SECTION_MAP[resolved.section] || 'overview';
  return <HelpDeskApp initialNavId={navId} />;
}
