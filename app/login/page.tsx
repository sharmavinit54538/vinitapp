import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function LoginPage() {
  return <Ofc360AuthPortal initialView="login" initialSection="auth" />;
}
