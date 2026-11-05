import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth Popup Callback Handler (`/auth/callback`)
 * Sends the OAuth authorization code or id_token back to the opener window via postMessage
 * and closes the popup window automatically, complying with AI Studio iframe constraints.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || 'google';
  const error = searchParams.get('error') || '';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>OFC360 OAuth Verification</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #081B3A;">
    <div style="text-align: center; padding: 24px;">
      <p style="font-weight: 600; font-size: 15px;">Completing OFC360 Enterprise Sign-In...</p>
      <p style="font-size: 13px; color: #64748B;">This window will close automatically.</p>
    </div>
    <script>
      (function() {
        var payload = {
          type: 'OFC360_OAUTH_CALLBACK',
          provider: ${JSON.stringify(state)},
          code: ${JSON.stringify(code)},
          error: ${JSON.stringify(error)}
        };
        if (window.opener) {
          window.opener.postMessage(payload, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
