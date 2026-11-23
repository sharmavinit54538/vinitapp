/**
 * Transient In-Memory Biometric & Capture Coordinate Vault
 *
 * Security & Privacy Guarantee:
 * - Raw face images (base64 / File / Blob) and precise GPS coordinates
 *   NEVER enter Redux state, Redux actions, Redux DevTools, localStorage,
 *   sessionStorage, or console logs.
 * - Callers store a live capture here and pass only an opaque short-lived
 *   `captureId` to RTK Query mutations. The mutation consumes and releases
 *   the entry in a `finally` block.
 */

import type { GpsReading } from './types';

export const ALLOWED_BREAK_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export const MAX_BREAK_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB

const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes

export interface TransientCapturePayload {
  imageBase64?: string;
  file?: Blob;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  gps?: GpsReading | null;
  capturedAtIso: string;
}

interface StoredCaptureEntry {
  payload: TransientCapturePayload;
  expiresAtMs: number;
}

const vault = new Map<string, StoredCaptureEntry>();

function generateOpaqueToken(prefix: string): string {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return `${prefix}_${globalThis.crypto.randomUUID().replace(/-/g, '')}`;
  }
  const randA = Math.random().toString(36).slice(2, 12);
  const randB = Math.random().toString(36).slice(2, 12);
  return `${prefix}_${Date.now().toString(36)}_${randA}${randB}`;
}

function purgeExpiredEntries(nowMs = Date.now()): void {
  for (const [id, entry] of vault.entries()) {
    if (entry.expiresAtMs <= nowMs) {
      vault.delete(id);
    }
  }
}

export function validateGpsCoordinates(gps: GpsReading): void {
  if (
    typeof gps.latitude !== 'number' ||
    !Number.isFinite(gps.latitude) ||
    gps.latitude < -90 ||
    gps.latitude > 90
  ) {
    throw new Error('GPS latitude must be a valid number between -90 and 90.');
  }
  if (
    typeof gps.longitude !== 'number' ||
    !Number.isFinite(gps.longitude) ||
    gps.longitude < -180 ||
    gps.longitude > 180
  ) {
    throw new Error('GPS longitude must be a valid number between -180 and 180.');
  }
  if (
    gps.accuracy !== undefined &&
    gps.accuracy !== null &&
    (typeof gps.accuracy !== 'number' ||
      !Number.isFinite(gps.accuracy) ||
      gps.accuracy < 0)
  ) {
    throw new Error('GPS accuracy must be a non-negative number in metres.');
  }
}

export function validateBreakMultipartFile(
  file: Blob,
  mimeType?: string
): void {
  const effectiveType = (mimeType || file.type || '').toLowerCase().trim();
  if (!ALLOWED_BREAK_MIME_TYPES.has(effectiveType)) {
    throw new Error(
      'Break capture image must be JPG, JPEG, PNG, or WEBP format.'
    );
  }
  if (file.size > MAX_BREAK_FILE_BYTES) {
    throw new Error('Break capture image exceeds the 10 MiB server limit.');
  }
}

/**
 * Stores a fresh camera/GPS capture in process memory only and returns an
 * opaque short-lived ID safe to pass through Redux actions.
 */
export function storeTransientCapture(
  payload: TransientCapturePayload,
  ttlMs = DEFAULT_TTL_MS
): string {
  purgeExpiredEntries();
  if (payload.gps) {
    validateGpsCoordinates(payload.gps);
  }
  const hasBase64 =
    typeof payload.imageBase64 === 'string' &&
    payload.imageBase64.trim().length > 0;
  const hasFile = payload.file !== undefined && payload.file !== null;
  if (!hasBase64 && !hasFile) {
    throw new Error('A fresh camera capture is required before submitting.');
  }

  const captureId = generateOpaqueToken('cap');
  vault.set(captureId, {
    payload: {
      ...payload,
      capturedAtIso: payload.capturedAtIso || new Date().toISOString(),
    },
    expiresAtMs: Date.now() + Math.max(5_000, ttlMs),
  });
  return captureId;
}

export function peekTransientCapture(
  captureId: string
): TransientCapturePayload | null {
  purgeExpiredEntries();
  const entry = vault.get(captureId);
  return entry ? entry.payload : null;
}

export function consumeTransientCapture(
  captureId: string
): TransientCapturePayload | null {
  purgeExpiredEntries();
  const entry = vault.get(captureId);
  if (!entry) return null;
  vault.delete(captureId);
  return entry.payload;
}

export function releaseTransientCapture(captureId: string): void {
  vault.delete(captureId);
}

export function clearTransientCaptures(): void {
  vault.clear();
}

export function getTransientCaptureCount(): number {
  purgeExpiredEntries();
  return vault.size;
}

// ---------------------------------------------------------------------------
// Per-Action Idempotency Keys (8–128 chars) & V2 Replay Management
// ---------------------------------------------------------------------------

/**
 * Generates a unique Idempotency-Key (8–128 chars) for a single logical
 * attendance action. Always call once per distinct logical action.
 */
export function generateIdempotencyKey(actionPrefix = 'att'): string {
  const safePrefix = actionPrefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24) || 'att';
  const key = generateOpaqueToken(safePrefix);
  return key.slice(0, 128);
}

export function assertValidIdempotencyKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length < 8 || trimmed.length > 128) {
    throw new Error('Idempotency-Key must be between 8 and 128 characters.');
  }
  return trimmed;
}

export interface LogicalPunchAction {
  readonly actionType: 'check_in' | 'check_out';
  readonly captureId: string;
  readonly idempotencyKey: string;
  readonly capturedAtIso: string;
}

/**
 * Creates a logical V2 PWA punch action binding a fresh capture to one
 * idempotency key. Replaying the exact same logical action preserves the
 * original key and payload; a fresh capture must create a new LogicalPunchAction.
 */
export function createLogicalPunchAction(
  actionType: 'check_in' | 'check_out',
  capture: TransientCapturePayload
): LogicalPunchAction {
  const captureId = storeTransientCapture(capture);
  const idempotencyKey = generateIdempotencyKey(`pwa_${actionType}`);
  return {
    actionType,
    captureId,
    idempotencyKey,
    capturedAtIso: capture.capturedAtIso || new Date().toISOString(),
  };
}
