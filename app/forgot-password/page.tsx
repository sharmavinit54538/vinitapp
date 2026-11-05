import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function ForgotPasswordPage() {
  return (
    <Ofc360AuthPortal initialView="forgot-password" initialSection="auth" />
  );
}
