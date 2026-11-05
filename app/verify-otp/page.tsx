import React from 'react';
import { Ofc360AuthPortal } from '@/components/auth/ofc360-auth-portal';

export default function VerifyOtpPage() {
  return (
    <Ofc360AuthPortal initialView="verify-otp" initialSection="verification" />
  );
}
