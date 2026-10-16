/**
 * Core API client for the HMS mobile app.
 *
 * Cold-start behaviour (Render free tier sleeps after 15 min):
 *  - First timeout is generous (COLD_START_TIMEOUT_MS = 70 s).
 *  - If a request takes longer than SLOW_REQUEST_MS (4 s), the module emits
 *    a "waking-up" event that screens can subscribe to via onSlowRequest().
 *  - Automatic retry with exponential back-off on transient errors.
 */

import Constants from 'expo-constants';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Priority: EXPO_PUBLIC_API_URL env var → expoConfig extra → localhost fallback
const _envUrl: string | undefined =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as Record<string, string> | undefined)
    ?.apiUrl;

export const API_BASE_URL: string =
  (_envUrl ?? 'http://localhost:3000').replace(/\/+$/, '');

// ── Timeouts & retry config ───────────────────────────────────────────────────
/** Normal per-request timeout (ms). */
const NORMAL_TIMEOUT_MS = 25_000;

/**
 * Extended timeout for the very first request after a Render cold-start.
 * Render free-tier instances can take 50-60 s to wake from sleep.
 */
const COLD_START_TIMEOUT_MS = 70_000;

/** After this many ms without a response, fire the "slow" event. */
const SLOW_REQUEST_MS = 4_000;

/** Maximum automatic retries on transient network/server errors. */
const MAX_RETRIES = 3;

/** Base delay for exponential back-off (ms). */
const RETRY_BASE_MS = 800;

// ── Slow-request event bus ────────────────────────────────────────────────────
type SlowListener = (slow: boolean) => void;
const _slowListeners = new Set<SlowListener>();
let _activeSlowRequests = 0;

function _notifySlowListeners() {
  const slow = _activeSlowRequests > 0;
  _slowListeners.forEach((fn) => fn(slow));
}

/**
 * Subscribe to slow-request events. The callback is called with `true` when
 * at least one request is taking longer than SLOW_REQUEST_MS, and `false`
 * when all slow requests have completed.
 *
 * Returns an unsubscribe function.
 *
 * Usage (in a React component or hook):
 *   useEffect(() => onSlowRequest(setSlow), []);
 */
export function onSlowRequest(listener: SlowListener): () => void {
  _slowListeners.add(listener);
  return () => _slowListeners.delete(listener);
}

// ── Token injection ───────────────────────────────────────────────────────────
let _getToken: () => string | null = () => null;

/** Called by AuthContext immediately after a token is stored or cleared. */
export function setTokenGetter(fn: () => string | null): void {
  _getToken = fn;
}

// ── Error class ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isRetryable(err: unknown, status?: number): boolean {
  if (status && status >= 400 && status < 500) return false; // client errors → don't retry
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes('aborteddue') || m.includes('timed out')) return true;
    if (m.includes('network') || m.includes('fetch')) return true;
  }
  if (!status || status >= 500) return true;
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Core fetch ────────────────────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  options: RequestInit & {
    /** Override the auth token for this specific call (pass '' to skip auth). */
    token?: string;
    /** Override timeout for this specific call. */
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { token, timeoutMs, headers, ...rest } = options;
  const resolvedToken = token !== undefined ? token : _getToken();

  // Use the generous cold-start timeout for unauthenticated calls (e.g. login,
  // health) because those are the first requests after a cold-start.
  const effectiveTimeout = timeoutMs ?? (resolvedToken ? NORMAL_TIMEOUT_MS : COLD_START_TIMEOUT_MS);

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();

    // Slow-request banner tracking
    const slowTimer = setTimeout(() => {
      _activeSlowRequests += 1;
      _notifySlowListeners();
    }, SLOW_REQUEST_MS);

    const hardTimeout = setTimeout(() => controller.abort(), effectiveTimeout);

    let response: Response | undefined;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
          ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
          ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
          ...(headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(slowTimer);
      clearTimeout(hardTimeout);

      // Undo slow counter if it fired
      if (_activeSlowRequests > 0) {
        _activeSlowRequests -= 1;
        _notifySlowListeners();
      }

      const isAbort = err instanceof Error && err.name === 'AbortError';
      const msg = isAbort
        ? `Server took too long to respond (>${Math.round(effectiveTimeout / 1000)}s). The server may be waking up — please retry.`
        : 'Unable to reach the server. Check your network connection.';

      lastError = new ApiError(msg, 0);

      if (attempt < MAX_RETRIES && isRetryable(err)) {
        await delay(RETRY_BASE_MS * attempt);
        continue;
      }
      throw lastError;
    } finally {
      clearTimeout(hardTimeout);
    }

    clearTimeout(slowTimer);
    if (_activeSlowRequests > 0) {
      _activeSlowRequests -= 1;
      _notifySlowListeners();
    }

    // ── Parse error responses ────────────────────────────────────────────────
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const text = await response.text();
        if (text) {
          try {
            const payload = JSON.parse(text) as { message?: string | string[]; error?: string };
            if (Array.isArray(payload.message)) message = payload.message.join(' ');
            else message = payload.message || payload.error || text;
          } catch {
            message = text.slice(0, 300);
          }
        }
      } catch { /* ignore */ }

      // Redirect to login on 401 (handled by AuthContext; just throw here)
      const apiErr = new ApiError(message, response.status);
      lastError = apiErr;

      if (attempt < MAX_RETRIES && isRetryable(apiErr, response.status)) {
        await delay(RETRY_BASE_MS * attempt);
        continue;
      }
      throw apiErr;
    }

    return response.json() as Promise<T>;
  }

  throw lastError ?? new ApiError('Request failed after retries.', 0);
}
