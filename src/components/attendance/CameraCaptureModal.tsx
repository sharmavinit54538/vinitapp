'use client';

/**
 * Live Camera & Geolocation Capture Modal for OFC360 Attendance
 *
 * Lifecycle & Biometric Hygiene Guarantees:
 * - Opens getUserMedia ONLY while this modal is open for the selected action.
 * - Stops all MediaStream tracks and clears navigator.geolocation watch on
 *   capture completion, cancel, error, background (`visibilitychange`), or unmount.
 * - Never sends dummy coordinates, cached photos, or client-computed face matches.
 * - Never stores raw image base64 or precise GPS coordinates in Redux state/actions;
 *   places the live capture in the transient in-memory captureVault and dispatches
 *   only the opaque `captureId`.
 * - Sends ONE punch API per action (V1 biometric OR V2 PWA); never double-sends
 *   and never falls back to legacy core punch on error.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  useEndBreakMutation,
  useEnrollFaceMutation,
  useFaceCheckInMutation,
  useFaceCheckOutMutation,
  useStartBreakMutation,
  useV2PwaCheckInMutation,
  useV2PwaCheckOutMutation,
  useVerifyGeofenceMutation,
} from '@/src/features/attendance/attendanceApi';
import {
  generateIdempotencyKey,
  releaseTransientCapture,
  storeTransientCapture,
} from '@/src/features/attendance/captureVault';
import type { PunchContractMode } from '@/src/features/attendance/attendanceSlice';
import type {
  AttendanceApiError,
  GeofenceVerifyResult,
  GpsReading,
  WorkMode,
} from '@/src/features/attendance/types';

export type AttendanceCaptureAction =
  | 'enroll'
  | 're_enroll'
  | 'check_in'
  | 'check_out'
  | 'break_start'
  | 'break_end';

interface CameraCaptureModalProps {
  open: boolean;
  action: AttendanceCaptureAction | null;
  workMode: WorkMode;
  punchContract: PunchContractMode;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onReconcileToday: () => void;
}

const ACTION_COPY: Record<
  AttendanceCaptureAction,
  { title: string; subtitle: string; cta: string; needsGps: boolean; showWorkMode: boolean }
> = {
  enroll: {
    title: 'Enroll your face',
    subtitle: 'Capture a clear, well-lit live photo to register your biometric profile.',
    cta: 'Capture & enroll',
    needsGps: false,
    showWorkMode: false,
  },
  re_enroll: {
    title: 'Replace enrolled face',
    subtitle: 'Explicit replacement enrollment updates your biometric template on the server.',
    cta: 'Capture & replace face',
    needsGps: false,
    showWorkMode: false,
  },
  check_in: {
    title: 'Biometric check-in',
    subtitle: 'Take a fresh live photo with GPS verification to start your shift.',
    cta: 'Capture & check in',
    needsGps: true,
    showWorkMode: true,
  },
  check_out: {
    title: 'Biometric check-out',
    subtitle: 'Take a fresh live photo to complete your shift and finalize server hours.',
    cta: 'Capture & check out',
    needsGps: true,
    showWorkMode: true,
  },
  break_start: {
    title: 'Start break',
    subtitle: 'Fresh facial verification is required before starting a break.',
    cta: 'Capture & start break',
    needsGps: true,
    showWorkMode: false,
  },
  break_end: {
    title: 'End break',
    subtitle: 'Fresh facial verification is required to resume work and close the break.',
    cta: 'Capture & end break',
    needsGps: true,
    showWorkMode: false,
  },
};

function isAttendanceApiError(value: unknown): value is AttendanceApiError {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'status' in (value as Record<string, unknown>) &&
    'message' in (value as Record<string, unknown>)
  );
}

function formatGpsError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission was denied. Enable browser location access and tap Retry GPS.';
    case err.POSITION_UNAVAILABLE:
      return 'Location is currently unavailable on this device. Move to an open area or enable location services.';
    case err.TIMEOUT:
      return 'GPS fix timed out. Please retry location capture.';
    default:
      return 'Unable to read live GPS coordinates.';
  }
}

export function CameraCaptureModal({
  open,
  action,
  workMode,
  punchContract,
  onClose,
  onSuccess,
  onReconcileToday,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const lastReplayRef = useRef<{
    action: 'check_in' | 'check_out';
    captureId: string;
    idempotencyKey: string;
  } | null>(null);

  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'ready' | 'error'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gpsState, setGpsState] = useState<'idle' | 'locating' | 'ready' | 'error'>('idle');
  const [gpsReading, setGpsReading] = useState<GpsReading | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceVerifyResult | null>(null);
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);
  const [canReplayV2, setCanReplayV2] = useState(false);

  const [enrollFace, { isLoading: isEnrolling }] = useEnrollFaceMutation();
  const [faceCheckIn, { isLoading: isCheckingIn }] = useFaceCheckInMutation();
  const [faceCheckOut, { isLoading: isCheckingOut }] = useFaceCheckOutMutation();
  const [startBreak, { isLoading: isStartingBreak }] = useStartBreakMutation();
  const [endBreak, { isLoading: isEndingBreak }] = useEndBreakMutation();
  const [v2PwaCheckIn, { isLoading: isV2CheckingIn }] = useV2PwaCheckInMutation();
  const [v2PwaCheckOut, { isLoading: isV2CheckingOut }] = useV2PwaCheckOutMutation();
  const [verifyGeofence, { isLoading: isVerifyingGeofence }] = useVerifyGeofenceMutation();

  const isSubmitting =
    isEnrolling ||
    isCheckingIn ||
    isCheckingOut ||
    isStartingBreak ||
    isEndingBreak ||
    isV2CheckingIn ||
    isV2CheckingOut;

  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore track stop error
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopGpsWatch = useCallback(() => {
    if (
      geoWatchIdRef.current !== null &&
      typeof navigator !== 'undefined' &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
  }, []);

  const releaseAllHardware = useCallback(() => {
    stopCameraTracks();
    stopGpsWatch();
    if (lastReplayRef.current) {
      releaseTransientCapture(lastReplayRef.current.captureId);
      lastReplayRef.current = null;
    }
  }, [stopCameraTracks, stopGpsWatch]);

  const startCamera = useCallback(async () => {
    stopCameraTracks();
    setCameraError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraState('error');
      setCameraError(
        'Camera capture is unavailable in this browser context. Use HTTPS or a device with a front-facing camera.'
      );
      return;
    }

    setCameraState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState('ready');
    } catch (err) {
      stopCameraTracks();
      setCameraState('error');
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Allow camera access in your browser settings and tap Retry camera.'
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError(
          'No camera device was detected. Connect or enable a camera to capture biometric attendance.'
        );
      } else {
        setCameraError(
          err instanceof Error && err.message
            ? `Unable to start camera: ${err.message}`
            : 'Unable to access the camera.'
        );
      }
    }
  }, [stopCameraTracks]);

  const startGpsCapture = useCallback(() => {
    stopGpsWatch();
    setGpsError(null);
    setGeofenceResult(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsState('error');
      setGpsError('Geolocation is not supported in this browser.');
      return;
    }

    setGpsState('locating');
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const reading: GpsReading = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:
            typeof position.coords.accuracy === 'number' &&
            Number.isFinite(position.coords.accuracy)
              ? Math.round(position.coords.accuracy)
              : null,
        };
        setGpsReading(reading);
        setGpsError(null);
        setGpsState('ready');
        // Stop watch once we have an accurate fix (<= 50m)
        if (reading.accuracy !== null && reading.accuracy !== undefined && reading.accuracy <= 50) {
          stopGpsWatch();
        }
      },
      (err) => {
        setGpsState('error');
        setGpsError(formatGpsError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
    geoWatchIdRef.current = watchId;
  }, [stopGpsWatch]);

  // Open hardware strictly when modal opens; tear down on close, background, or unmount
  useEffect(() => {
    if (!open || !action) {
      releaseAllHardware();
      return;
    }

    const meta = ACTION_COPY[action];
    const startTimer = window.setTimeout(() => {
      setSubmitError(null);
      setFieldErrors({});
      setRetryAfterSec(null);
      setCanReplayV2(false);
      setGeofenceResult(null);
      setNotes('');
      void startCamera();
      if (meta.needsGps) {
        startGpsCapture();
      } else {
        setGpsReading(null);
        setGpsState('idle');
        setGpsError(null);
      }
    }, 0);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        releaseAllHardware();
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !inFlightRef.current) {
        releaseAllHardware();
        onClose();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(startTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      releaseAllHardware();
    };
  }, [action, onClose, open, releaseAllHardware, startCamera, startGpsCapture]);

  const handleGeofencePrecheck = async () => {
    if (!gpsReading) {
      setGpsError('Live GPS coordinates are required before verifying geofence.');
      return;
    }
    setSubmitError(null);
    try {
      const verdict = await verifyGeofence({ gps: gpsReading }).unwrap();
      setGeofenceResult(verdict);
    } catch (err) {
      if (isAttendanceApiError(err)) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Unable to verify geofence with the server.');
      }
    }
  };

  const captureFreshFrame = (): { imageBase64: string; capturedAtIso: string } | null => {
    const video = videoRef.current;
    if (!video || cameraState !== 'ready' || video.videoWidth === 0 || video.videoHeight === 0) {
      setSubmitError('Camera feed is not ready yet. Ensure camera permission is granted and retry.');
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setSubmitError('Unable to read frame from camera.');
      return null;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (!dataUrl || !dataUrl.includes(',')) {
      setSubmitError('Captured image frame was empty. Please try again.');
      return null;
    }
    return {
      imageBase64: dataUrl,
      capturedAtIso: new Date().toISOString(),
    };
  };

  const handleMutationError = (err: unknown, isV2ReplayCandidate: boolean) => {
    if (isAttendanceApiError(err)) {
      setSubmitError(err.message);
      setFieldErrors(err.fieldErrors || {});
      setRetryAfterSec(err.retryAfterSeconds ?? null);
      if (err.isUncertainWrite || err.isConflict) {
        onReconcileToday();
        if (isV2ReplayCandidate && lastReplayRef.current) {
          setCanReplayV2(true);
        }
      }
      return;
    }
    setSubmitError('Attendance request failed. Server state was not assumed.');
    onReconcileToday();
  };

  const handleSubmitCapture = async (replayExistingV2 = false) => {
    if (!action || inFlightRef.current || isSubmitting) return;
    setSubmitError(null);
    setFieldErrors({});
    setRetryAfterSec(null);

    const meta = ACTION_COPY[action];
    const isPunchAction = action === 'check_in' || action === 'check_out';
    const useV2Pwa = isPunchAction && punchContract === 'v2_pwa';
    const deviceInfo =
      typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 250) : undefined;

    // Replay same logical V2 request with original payload + original Idempotency-Key
    if (replayExistingV2 && useV2Pwa && lastReplayRef.current) {
      inFlightRef.current = true;
      try {
        const { action: replayAction, captureId, idempotencyKey } = lastReplayRef.current;
        const result =
          replayAction === 'check_in'
            ? await v2PwaCheckIn({
                captureId,
                idempotencyKey,
                notes: notes.trim() || undefined,
                deviceInfo,
                preserveForReplay: true,
              }).unwrap()
            : await v2PwaCheckOut({
                captureId,
                idempotencyKey,
                notes: notes.trim() || undefined,
                deviceInfo,
                preserveForReplay: true,
              }).unwrap();
        releaseAllHardware();
        setCanReplayV2(false);
        onSuccess(
          result.message ||
            (result.idempotent_replay
              ? 'Server confirmed your previous punch replay.'
              : replayAction === 'check_in'
              ? 'Check-in confirmed by server.'
              : 'Check-out confirmed by server.')
        );
        onClose();
      } catch (err) {
        handleMutationError(err, true);
      } finally {
        inFlightRef.current = false;
      }
      return;
    }

    if (useV2Pwa && !gpsReading) {
      setSubmitError('Live GPS coordinates are required for V2 mobile punch.');
      return;
    }

    if (meta.needsGps && action === 'check_in' && !gpsReading) {
      setSubmitError(
        'Live GPS fix is not available yet. Enable location permissions or retry GPS before checking in.'
      );
      return;
    }

    const frame = captureFreshFrame();
    if (!frame) return;

    // Stop live camera & GPS immediately once frame is captured
    stopCameraTracks();
    stopGpsWatch();

    let captureId: string;
    try {
      captureId = storeTransientCapture({
        imageBase64: frame.imageBase64,
        gps: meta.needsGps ? gpsReading : null,
        capturedAtIso: frame.capturedAtIso,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to stage live capture.');
      return;
    }

    inFlightRef.current = true;
    try {
      if (action === 'enroll' || action === 're_enroll') {
        const res = await enrollFace({
          captureId,
          allowReEnroll: action === 're_enroll',
        }).unwrap();
        releaseAllHardware();
        onSuccess(
          res.message ||
            (action === 're_enroll'
              ? 'Face profile updated on server.'
              : 'Face profile enrolled on server.')
        );
        onClose();
      } else if (action === 'check_in') {
        if (useV2Pwa) {
          const idempotencyKey = generateIdempotencyKey('pwa_checkin');
          lastReplayRef.current = { action: 'check_in', captureId, idempotencyKey };
          const res = await v2PwaCheckIn({
            captureId,
            idempotencyKey,
            notes: notes.trim() || undefined,
            deviceInfo,
            preserveForReplay: true,
          }).unwrap();
          releaseAllHardware();
          onSuccess(res.message || 'V2 PWA check-in confirmed.');
          onClose();
        } else {
          const idempotencyKey = generateIdempotencyKey('v1_checkin');
          const res = await faceCheckIn({
            captureId,
            transport: 'json',
            workMode,
            notes: notes.trim() || undefined,
            deviceInfo,
            idempotencyKey,
          }).unwrap();
          releaseAllHardware();
          onSuccess(res.message || 'Biometric check-in confirmed.');
          onClose();
        }
      } else if (action === 'check_out') {
        if (useV2Pwa) {
          const idempotencyKey = generateIdempotencyKey('pwa_checkout');
          lastReplayRef.current = { action: 'check_out', captureId, idempotencyKey };
          const res = await v2PwaCheckOut({
            captureId,
            idempotencyKey,
            notes: notes.trim() || undefined,
            deviceInfo,
            preserveForReplay: true,
          }).unwrap();
          releaseAllHardware();
          onSuccess(res.message || 'V2 PWA check-out confirmed.');
          onClose();
        } else {
          const res = await faceCheckOut({
            captureId,
            transport: 'json',
            workMode,
            notes: notes.trim() || undefined,
            deviceInfo,
          }).unwrap();
          releaseAllHardware();
          onSuccess(res.message || 'Biometric check-out confirmed.');
          onClose();
        }
      } else if (action === 'break_start') {
        const res = await startBreak({
          captureId,
          transport: 'json',
          notes: notes.trim() || undefined,
          deviceInfo,
        }).unwrap();
        releaseAllHardware();
        onSuccess(res.message || 'Break started.');
        onClose();
      } else if (action === 'break_end') {
        const res = await endBreak({
          captureId,
          transport: 'json',
          notes: notes.trim() || undefined,
          deviceInfo,
        }).unwrap();
        releaseAllHardware();
        onSuccess(res.message || 'Break ended.');
        onClose();
      }
    } catch (err) {
      handleMutationError(err, useV2Pwa);
      // Restart camera if user wants to retry with a fresh photo
      if (!useV2Pwa) {
        releaseTransientCapture(captureId);
      }
    } finally {
      inFlightRef.current = false;
    }
  };

  if (!open || !action) return null;

  const meta = ACTION_COPY[action];
  const lowAccuracyWarning =
    gpsReading?.accuracy !== null &&
    gpsReading?.accuracy !== undefined &&
    gpsReading.accuracy > 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={meta.title}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 md:p-4"
      onClick={() => {
        if (!isSubmitting) {
          releaseAllHardware();
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[#171717] truncate">
              {meta.title}
            </h2>
            <p className="text-[12px] text-[#666666] truncate">{meta.subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Close biometric capture modal"
            disabled={isSubmitting}
            onClick={() => {
              releaseAllHardware();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 space-y-3.5">
          {/* Live Camera Viewport */}
          <div className="relative overflow-hidden rounded-md border border-[#E5E7EB] bg-[#171717] aspect-[4/3] flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${
                cameraState === 'ready' ? 'block' : 'hidden'
              }`}
            />
            {cameraState === 'starting' ? (
              <p className="text-[12px] text-[#D4D4D4]">Requesting live camera access…</p>
            ) : null}
            {cameraState === 'error' ? (
              <div className="px-5 py-4 text-center space-y-2.5">
                <Camera className="h-6 w-6 text-[#F87171] mx-auto" strokeWidth={1.8} />
                <p className="text-[12px] text-white leading-relaxed">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/25 px-3 text-[12px] font-semibold text-white hover:bg-white/10 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry camera
                </button>
              </div>
            ) : null}
          </div>

          {/* Live GPS & Optional Geofence Precheck */}
          {meta.needsGps ? (
            <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-[#404040] shrink-0" strokeWidth={1.85} />
                  <span className="text-[12px] font-semibold text-[#171717]">
                    Live location verification
                  </span>
                </div>
                <button
                  type="button"
                  onClick={startGpsCapture}
                  className="text-[12px] font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                >
                  Retry GPS
                </button>
              </div>

              {gpsState === 'locating' ? (
                <p className="text-[12px] text-[#666666]">Acquiring live GPS fix…</p>
              ) : null}

              {gpsState === 'error' && gpsError ? (
                <p className="text-[12px] text-[#B91C1C]" role="alert">
                  {gpsError}
                </p>
              ) : null}

              {gpsState === 'ready' && gpsReading ? (
                <div className="space-y-1.5">
                  <p className="text-[12px] text-[#404040] tabular-nums">
                    GPS fix acquired
                    {gpsReading.accuracy != null
                      ? ` · ±${gpsReading.accuracy}m accuracy`
                      : ''}
                    {meta.showWorkMode ? ` · Work mode: ${workMode}` : ''}
                  </p>
                  {lowAccuracyWarning ? (
                    <p className="text-[12px] text-[#B45309]">
                      GPS accuracy is lower than 100m. Move closer to a window or retry GPS for a
                      more accurate geofence check.
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isVerifyingGeofence}
                      onClick={() => void handleGeofencePrecheck()}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-semibold text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0A66C2]" />
                      {isVerifyingGeofence ? 'Checking geofence…' : 'Check geofence'}
                    </button>
                  </div>
                </div>
              ) : null}

              {geofenceResult ? (
                <div
                  className={`rounded-md border px-2.5 py-2 text-[12px] ${
                    geofenceResult.inside_geofence
                      ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {geofenceResult.inside_geofence ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>
                      {geofenceResult.inside_geofence ? 'Inside geofence' : 'Outside geofence'} ·{' '}
                      {geofenceResult.status}
                    </span>
                  </div>
                  {geofenceResult.message ? (
                    <p className="mt-0.5 text-[11px]">{geofenceResult.message}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Optional Note Input */}
          {action !== 'enroll' && action !== 're_enroll' ? (
            <div>
              <label
                htmlFor="attendance-capture-notes"
                className="block text-[12px] font-medium text-[#404040] mb-1"
              >
                Notes (optional)
              </label>
              <input
                id="attendance-capture-notes"
                type="text"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional shift or location note"
                className="h-9 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
          ) : null}

          {/* Error & Field Error Feedback */}
          {submitError ? (
            <div
              role="alert"
              className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[12px] text-[#B91C1C] space-y-1"
            >
              <p className="font-semibold">{submitError}</p>
              {retryAfterSec !== null ? (
                <p className="text-[11px] tabular-nums">
                  Server requested waiting {retryAfterSec}s before retrying.
                </p>
              ) : null}
              {Object.entries(fieldErrors).map(([field, messages]) =>
                field === '_general' ? null : (
                  <p key={field} className="text-[11px]">
                    {field}: {messages.join(', ')}
                  </p>
                )
              )}
              {canReplayV2 ? (
                <button
                  type="button"
                  onClick={() => void handleSubmitCapture(true)}
                  className="mt-1 inline-flex h-7 items-center rounded-md border border-[#B91C1C] bg-white px-2.5 text-[11px] font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                >
                  Replay same V2 request safely
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              releaseAllHardware();
              onClose();
            }}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || cameraState !== 'ready'}
            onClick={() => void handleSubmitCapture(false)}
            className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting…' : meta.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
