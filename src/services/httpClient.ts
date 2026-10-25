import { Env } from '../configuration/env';
import { SecureTokenStorage } from '../storage/secureStorage';
import { ApiError, ApiResponse } from '../types';

export interface RequestOptions {
  isPublic?: boolean;
  isRetry?: boolean;
  headers?: Record<string, string>;
}

export class HttpClient {
  private static refreshPromise: Promise<string | null> | null = null;
  private static onSessionExpiredCallback: (() => void) | null = null;

  public static registerSessionExpiredHandler(handler: () => void): void {
    HttpClient.onSessionExpiredCallback = handler;
  }

  private static async getHeaders(isPublic = false): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (!isPublic) {
      const token = await SecureTokenStorage.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static normalizeError(error: unknown, fallbackStatus = 0): ApiError {
    if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
      const apiErr = error as ApiError;
      return {
        code: apiErr.code || 'HTTP_ERROR',
        message: apiErr.message || 'Request failed',
        status: apiErr.status !== undefined ? apiErr.status : fallbackStatus,
        details: apiErr.details,
      };
    }

    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (error.name === 'AbortError' || msg.includes('aborted') || msg.includes('abort')) {
        return {
          code: 'ABORT_ERROR',
          message: 'Request timed out.',
          status: 408,
        };
      }
      return {
        code: 'NETWORK_ERROR',
        message: error.message || 'Unable to connect to server.',
        status: 0,
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: 'An unexpected network error occurred.',
      status: 0,
    };
  }

  private static isPublicEndpoint(endpoint: string): boolean {
    return (
      endpoint.startsWith('/auth/login') ||
      endpoint.startsWith('/auth/refresh') ||
      endpoint.startsWith('/users')
    );
  }

  private static async handleSingleFlightRefresh(): Promise<string | null> {
    if (HttpClient.refreshPromise) {
      return HttpClient.refreshPromise;
    }

    HttpClient.refreshPromise = (async () => {
      try {
        const refreshToken = await SecureTokenStorage.getRefreshToken();
        if (!refreshToken) {
          await SecureTokenStorage.clearTokens();
          HttpClient.onSessionExpiredCallback?.();
          return null;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), Env.requestTimeoutMs);

        const response = await fetch(`${Env.apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          await SecureTokenStorage.clearTokens();
          HttpClient.onSessionExpiredCallback?.();
          return null;
        }

        const data = await response.json();
        if (data.accessToken && data.refreshToken) {
          await SecureTokenStorage.saveTokens(data.accessToken, data.refreshToken);
          return data.accessToken as string;
        }

        await SecureTokenStorage.clearTokens();
        HttpClient.onSessionExpiredCallback?.();
        return null;
      } catch {
        await SecureTokenStorage.clearTokens();
        HttpClient.onSessionExpiredCallback?.();
        return null;
      } finally {
        HttpClient.refreshPromise = null;
      }
    })();

    return HttpClient.refreshPromise;
  }

  public static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const isPublic = options.isPublic ?? HttpClient.isPublicEndpoint(endpoint);

    try {
      const baseHeaders = await HttpClient.getHeaders(isPublic);
      const combinedHeaders = {
        ...baseHeaders,
        ...(options.headers || {}),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Env.requestTimeoutMs);

      const url = endpoint.startsWith('http') ? endpoint : `${Env.apiBaseUrl}${endpoint}`;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[AUTH REQUEST] method: ${method} url: ${url}`);
      }

      const response = await fetch(url, {
        method,
        headers: combinedHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[AUTH RESPONSE] status: ${response.status} url: ${url}`);
      }

      if (response.status === 401 && !isPublic && !options.isRetry) {
        const newToken = await HttpClient.handleSingleFlightRefresh();
        if (newToken) {
          return HttpClient.request<T>(endpoint, method, body, {
            ...options,
            isRetry: true,
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          code: errorData.code || (response.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'HTTP_ERROR'),
          message: errorData.message || `Request failed with status ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      const data = response.status === 204 ? ({} as T) : await response.json().catch(() => ({} as T));
      return { data, status: response.status };
    } catch (error) {
      const normalized = HttpClient.normalizeError(error);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[AUTH ERROR] code: ${normalized.code} message: ${normalized.message} status: ${normalized.status}`);
      }
      throw normalized;
    }
  }

  public static async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return HttpClient.request<T>(endpoint, 'GET', undefined, options);
  }

  public static async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return HttpClient.request<T>(endpoint, 'POST', body, options);
  }

  public static async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return HttpClient.request<T>(endpoint, 'PUT', body, options);
  }

  public static async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return HttpClient.request<T>(endpoint, 'DELETE', undefined, options);
  }
}
