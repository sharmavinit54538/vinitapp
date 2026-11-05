import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function MfaVerifyPage() {
  return <Ofc360AuthPortal initialView="mfa-verify" initialSection="auth" />;
}
