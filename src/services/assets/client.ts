import { API_BASE_URL, authClient } from '../../../lib/auth-api';

export interface AssetApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class AssetApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AssetApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isPermissionDenied(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }
}

export function buildAssetQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  }
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export function maskAssetSensitiveValue(
  rawValue: string | undefined | null,
  visibleTrailing = 4
): string {
  if (!rawValue) return '••••••••';
  const trimmed = rawValue.trim();
  if (trimmed.length <= visibleTrailing) {
    return '••••';
  }
  return `••••-••••-${trimmed.slice(-visibleTrailing)}`;
}

export function formatAssetCurrency(
  amount: number | undefined | null,
  currency = 'INR',
  locale = 'en-IN'
): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '—';
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface AssetRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retriesForGet?: number;
}

export class AssetHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl?: string, fetchImpl?: typeof fetch) {
    const defaultBase = `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/assets`;
    this.baseUrl = (baseUrl || defaultBase).replace(/\/$/, '');
    this.fetchImpl = fetchImpl || fetch.bind(globalThis);
  }

  private buildHeaders(
    extra?: Record<string, string>,
    isFormData = false
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(extra || {}),
    };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const token = authClient.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: AssetRequestOptions
  ): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    const maxAttempts =
      method === 'GET' ? Math.max(1, (options?.retriesForGet ?? 1) + 1) : 1;

    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.fetchImpl(url, {
          method,
          headers: this.buildHeaders(options?.headers, isFormData),
          body:
            body === undefined
              ? undefined
              : isFormData
              ? (body as FormData)
              : JSON.stringify(body),
          signal: options?.signal,
        });

        if (!response.ok) {
          if (
            method === 'GET' &&
            attempt < maxAttempts &&
            (response.status === 502 ||
              response.status === 503 ||
              response.status === 504)
          ) {
            await new Promise((r) => setTimeout(r, 150 * attempt));
            continue;
          }

          let parsedError: AssetApiErrorPayload | null = null;
          try {
            const errJson = (await response.json()) as {
              error?: AssetApiErrorPayload;
              message?: string;
            };
            if (errJson?.error) {
              parsedError = errJson.error;
            } else if (errJson?.message) {
              parsedError = {
                code: `HTTP_${response.status}`,
                message: errJson.message,
              };
            }
          } catch {
            // Non-JSON error body
          }

          throw new AssetApiError(
            response.status,
            parsedError?.code ||
              (response.status === 403
                ? 'FORBIDDEN'
                : `HTTP_${response.status}`),
            parsedError?.message ||
              `Asset API error (${response.status} ${response.statusText || 'Request Failed'})`,
            parsedError?.details
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof AssetApiError) {
          throw err;
        }
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || attempt >= maxAttempts)
        ) {
          throw new AssetApiError(
            0,
            err.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            err.message || 'Network request failed'
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new AssetApiError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  public async downloadBlob(
    path: string,
    filename: string,
    options?: AssetRequestOptions
  ): Promise<void> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers, true),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new AssetApiError(
        response.status,
        response.status === 403 ? 'FORBIDDEN' : `HTTP_${response.status}`,
        `Failed to download file (${response.status})`
      );
    }

    const blob = await response.blob();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    }
  }
}

export const assetHttpClient = new AssetHttpClient();
