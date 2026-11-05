import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function RegisterPage() {
  return <Ofc360AuthPortal initialView="register" initialSection="auth" />;
}
