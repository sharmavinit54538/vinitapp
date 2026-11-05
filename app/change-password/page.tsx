import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function ChangePasswordPage() {
  return (
    <Ofc360AuthPortal initialView="change-password" initialSection="auth" />
  );
}
