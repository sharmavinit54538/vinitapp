import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function ResetPasswordPage() {
  return (
    <Ofc360AuthPortal initialView="reset-password" initialSection="auth" />
  );
}
