export function getAuthErrorMessageKey(error: unknown): string {
  if (!error) return 'auth.errors.unexpectedError';

  let code = '';
  let status = 0;
  let message = '';

  if (error instanceof Error) {
    message = error.message.toLowerCase();
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.code === 'string') {
      code = errObj.code;
    }
    if (typeof errObj.status === 'number') {
      status = errObj.status;
    }
    if (typeof errObj.message === 'string') {
      message = (errObj.message as string).toLowerCase();
    }
  }

  if (
    code === 'CLIENT_ERROR' ||
    code === 'NETWORK_ERROR' ||
    code === 'FETCH_ERROR' ||
    code === 'ABORT_ERROR' ||
    status === 408 ||
    status === 0 ||
    status === 503 ||
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('aborted') ||
    message.includes('abort') ||
    message.includes('econnrefused') ||
    message.includes('etimedout')
  ) {
    return 'auth.errors.networkError';
  }

  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'auth.errors.invalidCredentials';
    case 'ACCOUNT_SUSPENDED':
      return 'auth.errors.accountSuspended';
    case 'ACCOUNT_DEACTIVATED':
      return 'auth.errors.accountDeactivated';
    case 'ACCOUNT_NOT_VERIFIED':
      return 'auth.errors.accountNotVerified';
    case 'AUTHENTICATION_REQUIRED':
      return 'auth.errors.authenticationRequired';
    case 'TOKEN_INVALID':
    case 'TOKEN_EXPIRED':
    case 'TOKEN_REVOKED':
    case 'REFRESH_TOKEN_INVALID':
      return 'auth.errors.sessionExpired';
    case 'ACCESS_DENIED':
      return 'auth.errors.accessDenied';
    case 'DUPLICATE_RESOURCE':
      return 'auth.errors.emailAlreadyExists';
    case 'VALIDATION_ERROR':
      return 'auth.errors.validationError';
    default:
      if (status === 401) {
        return 'auth.errors.sessionExpired';
      }
      if (status === 403) {
        return 'auth.errors.accessDenied';
      }
      return 'auth.errors.unexpectedError';
  }
}
