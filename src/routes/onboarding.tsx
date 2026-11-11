'use client';

import React from 'react';
import { OnboardingPage } from '../screens/OnboardingPage';

export const onboardingRouteMetadata = {
  path: '/onboarding',
  title: 'HR Admin Post-Registration Onboarding Wizard',
  requiresAuth: true,
};

export function OnboardingRouteComponent() {
  return <OnboardingPage />;
}

export default OnboardingRouteComponent;
