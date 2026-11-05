import React from 'react';
import { HelpDeskApp } from '@/components/helpdesk/helpdesk-app';

export default async function HelpDeskTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <HelpDeskApp initialNavId="all_tickets" initialTicketId={resolved.id} />;
}
