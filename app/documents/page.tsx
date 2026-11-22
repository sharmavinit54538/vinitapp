import React from 'react';
import { EmployeeDocumentsWorkspaceShell } from '../../src/components/documents/EmployeeDocumentsWorkspaceShell';

export default function EmployeeDocumentsPage() {
  return <EmployeeDocumentsWorkspaceShell startInDirectory={true} initialModule="overview" />;
}
