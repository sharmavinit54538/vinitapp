import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function VerifyEmailPage() {
  return (
    <Ofc360AuthPortal
      initialView="verify-email"
      initialSection="verification"
    />
  );
}
