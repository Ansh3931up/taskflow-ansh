/** Backend wraps many responses as `{ data, statusCode, message, success }`; auth routes return raw JSON. */
export function unwrapApiData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    'statusCode' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const msg = (error as { error?: unknown }).error;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
