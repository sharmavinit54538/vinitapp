import { NextRequest, NextResponse } from 'next/server';
import { Ofc360Role } from '@/lib/auth-schemas';

function resolveRoleFromEmail(email: string): Ofc360Role {
  const lower = email.toLowerCase();
  if (lower.includes('it_admin') || lower.includes('itadmin') || lower.startsWith('it@')) {
    return 'it_admin';
  }
  if (lower.includes('manager')) {
    return 'manager';
  }
  if (lower.includes('executive') || lower.startsWith('exec@')) {
    return 'executive';
  }
  if (lower.includes('employee') || lower.startsWith('emp@')) {
    return 'employee';
  }
  return 'hr_admin';
}

const DUMMY_USER = {
  id: 'usr_ofc360_hr_admin',
  email: 'hradmin@ofc360.com',
  full_name: 'Aarav Sharma',
  phone: '+91 98765 43210',
  company_name: 'OFC360 Enterprise',
  role: 'hr_admin' as Ofc360Role,
  email_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

async function simulateNetworkDelay(ms = 350) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  await simulateNetworkDelay(200);
  const { slug } = await context.params;
  const action = slug.join('/');

  if (action === 'me') {
    const emailParam = req.nextUrl.searchParams.get('email') || DUMMY_USER.email;
    return NextResponse.json({
      user: {
        ...DUMMY_USER,
        email: emailParam,
        role: resolveRoleFromEmail(emailParam),
      },
    });
  }

  return NextResponse.json({ status: 'ok', endpoint: action });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  await simulateNetworkDelay(380);
  const { slug } = await context.params;
  const action = slug.join('/');

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  switch (action) {
    case 'login': {
      const email = String(body.email || DUMMY_USER.email).trim();
      const password = String(body.password || '');

      if (!email || !password) {
        return NextResponse.json(
          { detail: 'Please enter both work email and password.' },
          { status: 400 }
        );
      }

      if (password === 'wrong' || password === 'invalid') {
        return NextResponse.json(
          { detail: 'Invalid work email or password. Try Admin@360.' },
          { status: 401 }
        );
      }

      // Redirect login to the Verify OTP challenge as requested
      return NextResponse.json({
        requires_otp: true,
        requires_mfa: false,
        email_verified: true,
        is_active: true,
        message: `A 6-digit verification code has been sent to ${email}. (Demo OTP: 123456)`,
        user: {
          ...DUMMY_USER,
          email,
          role: resolveRoleFromEmail(email),
        },
      });
    }

    case 'verify-otp': {
      const otp = String(body.otp || body.code || '').trim();
      const email = String(body.email || DUMMY_USER.email).trim();

      if (otp === '000000') {
        return NextResponse.json(
          { detail: 'Invalid 6-digit verification code. Use 123456.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        access_token: 'ofc360-demo-jwt-token-2026',
        token_type: 'bearer',
        message: 'Identity verified successfully. Welcome to your OFC360 workspace.',
        user: {
          ...DUMMY_USER,
          email,
          role: resolveRoleFromEmail(email),
        },
      });
    }

    case 'register': {
      const email = String(body.email || DUMMY_USER.email).trim();
      const fullName = String(body.full_name || DUMMY_USER.full_name).trim();
      const companyName = String(body.company_name || DUMMY_USER.company_name).trim();

      return NextResponse.json({
        requires_otp: true,
        email_verified: false,
        is_active: true,
        message: `Workspace "${companyName}" created for ${fullName}. Please verify your 6-digit OTP (123456) to continue.`,
        user: {
          ...DUMMY_USER,
          email,
          full_name: fullName,
          company_name: companyName,
          role: resolveRoleFromEmail(email),
        },
      });
    }

    case 'forgot-password': {
      const email = String(body.email || DUMMY_USER.email).trim();
      return NextResponse.json({
        message: `A 6-digit verification code has been sent to ${email}. (Demo OTP: 123456)`,
      });
    }

    case 'reset-password': {
      return NextResponse.json({
        message: 'Your workspace password has been reset successfully. You may now sign in.',
      });
    }

    case 'verify-email': {
      return NextResponse.json({
        status: 'verified',
        message: 'Your work email address has been verified.',
      });
    }

    case 'activate': {
      return NextResponse.json({
        status: 'activated',
        message: 'Your OFC360 enterprise account has been activated.',
      });
    }

    case 'change-password': {
      return NextResponse.json({
        message: 'Your workspace password has been updated successfully.',
      });
    }

    case 'refresh': {
      return NextResponse.json({
        access_token: 'ofc360-refreshed-jwt-token-2026',
        token_type: 'bearer',
      });
    }

    case 'logout': {
      return NextResponse.json({
        message: 'Signed out successfully.',
      });
    }

    default:
      return NextResponse.json({
        access_token: 'ofc360-demo-jwt-token-2026',
        user: DUMMY_USER,
      });
  }
}
