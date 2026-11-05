import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function ActivateAccountPage() {
  return (
    <Ofc360AuthPortal initialView="activate-account" initialSection="auth" />
  );
}
