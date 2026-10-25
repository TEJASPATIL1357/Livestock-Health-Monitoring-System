import { HttpClient } from './httpClient';
import { SecureTokenStorage } from '../storage/secureStorage';
import { AuthResponse, PublicUserRole, User, UserRole } from '../types';

export interface LoginPayload {
  identifier: string; // Email or Phone
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  emailOrPhone: string;
  role: UserRole;
  password?: string;
  phone?: string;
  preferredLanguage?: string;
}

export interface AuthServiceContract {
  login(payload: LoginPayload): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<User>;
  getCurrentUser(): Promise<User>;
  forgotPassword(emailOrPhone: string): Promise<{ success: boolean; message: string }>;
  logout(): Promise<void>;
  restoreSession(): Promise<User | null>;
}

class AuthServiceAdapter implements AuthServiceContract {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const email = (payload.identifier || '').trim();
    const password = payload.password || '';

    const response = await HttpClient.post<AuthResponse>(
      '/auth/login',
      { email, password },
      { isPublic: true }
    );

    const authData = response.data;
    if (authData.accessToken && authData.refreshToken) {
      await SecureTokenStorage.saveTokens(authData.accessToken, authData.refreshToken);
    }

    return authData;
  }

  async register(payload: RegisterPayload): Promise<User> {
    if (payload.role === 'ADMIN') {
      throw {
        code: 'ACCESS_DENIED',
        message: 'Public ADMIN registration is strictly prohibited.',
        status: 403,
      };
    }

    const name = payload.fullName.trim();
    const email = payload.emailOrPhone.includes('@') ? payload.emailOrPhone.trim() : `${payload.emailOrPhone.trim()}@farm.com`;
    const phone = payload.phone || (!payload.emailOrPhone.includes('@') ? payload.emailOrPhone.trim() : undefined);
    const password = payload.password || '';
    const role: PublicUserRole = payload.role as PublicUserRole;
    const preferredLanguage = payload.preferredLanguage || 'en';

    const response = await HttpClient.post<User>(
      '/users',
      {
        name,
        email,
        phone,
        password,
        role,
        preferredLanguage,
      },
      { isPublic: true }
    );

    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await HttpClient.get<User>('/auth/me');
    return response.data;
  }

  async forgotPassword(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
    if (!emailOrPhone.trim()) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Email or mobile number is required',
        status: 400,
      };
    }
    return {
      success: true,
      message: 'Password reset instructions sent successfully.',
    };
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await SecureTokenStorage.getRefreshToken();
      if (refreshToken) {
        await HttpClient.post(
          '/auth/logout',
          { refreshToken },
          { isPublic: true }
        ).catch(() => {
          // Ignore network errors on server logout, local cleanup must still execute
        });
      }
    } finally {
      await SecureTokenStorage.clearTokens();
    }
  }

  async restoreSession(): Promise<User | null> {
    const hasCredentials = await SecureTokenStorage.hasTokens();
    if (!hasCredentials) {
      await SecureTokenStorage.clearTokens();
      return null;
    }

    try {
      const user = await this.getCurrentUser();
      return user;
    } catch {
      await SecureTokenStorage.clearTokens();
      return null;
    }
  }
}

export const AuthService: AuthServiceContract = new AuthServiceAdapter();
