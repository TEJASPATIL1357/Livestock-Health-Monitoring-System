export type LanguageCode = 'en' | 'hi' | 'mr';

export type PublicUserRole = 'FARM_OWNER' | 'FARM_MANAGER' | 'VETERINARIAN' | 'FARMER';
export type UserRole = PublicUserRole | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export type AuthSessionStatus = 'SESSION_RESTORING' | 'SESSION_AUTHENTICATED' | 'SESSION_UNAUTHENTICATED';

export type FarmState = 'NEW' | 'ACTIVE' | 'NEEDS_ATTENTION';

export type AnimalDataState = 'NO_ANIMALS' | 'ANIMALS_NO_DATA' | 'RECEIVING_DATA';

export type DeviceState = 'NO_DEVICES' | 'OFFLINE' | 'ONLINE' | 'LOW_BATTERY' | 'ERROR';

export type HealthState = 'NO_DATA' | 'AWAITING_TELEMETRY' | 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'CRITICAL';

export type LivestockType = 'DAIRY' | 'BEEF' | 'MIXED';
export type FarmStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type MembershipRole = 'FARM_OWNER' | 'FARM_MANAGER' | 'VETERINARIAN' | 'WORKER';
export type MembershipStatus = 'ACTIVE' | 'PENDING' | 'REVOKED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: AccountStatus;
  preferredLanguage?: string;
  selectedLanguage?: LanguageCode;
  createdAt?: string;
}

export interface Farm {
  id: string;
  name: string;
  district?: string;
  state?: string;
  country?: string;
  livestockType: LivestockType;
  status: FarmStatus;
  location?: string;
  totalLivestock?: number;
  cattleType?: LivestockType;
  createdAt: string;
  updatedAt?: string;
}

export interface FarmMembership {
  id: string;
  farmId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  farm: Farm;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFarmPayload {
  name: string;
  district?: string;
  state?: string;
  country?: string;
  livestockType?: LivestockType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
  user: User;
  farm?: Farm;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface Animal {
  id: string;
  farmId: string;
  name: string;
  tagNumber: string;
  species: 'CATTLE' | 'BUFFALO';
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  status: 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnimalPayload {
  farmId: string;
  name: string;
  tagNumber?: string;
  species?: 'CATTLE' | 'BUFFALO';
  breed?: string;
  dateOfBirth?: string;
  gender?: 'FEMALE' | 'MALE';
}

export interface Device {
  id: string;
  deviceIdentifier: string;
  farmId: string;
  animalId?: string;
  animalName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNASSIGNED';
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorTelemetry {
  id: string;
  deviceId: string;
  deviceIdentifier: string;
  animalId: string;
  animalName?: string;
  farmId: string;
  temperature: number;
  measuredAt: string;
  ingestedAt: string;
  movementAvailable: boolean;
  movementStatus: string;
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
  isStale: boolean;
  isDisconnected: boolean;
}

export interface AiAssessment {
  id: string;
  animalId: string;
  animalName?: string;
  farmId: string;
  healthStatus: 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL' | 'INSUFFICIENT_DATA';
  summaryEn: string;
  summaryHi?: string;
  summaryMr?: string;
  readingCount: number;
  avgTemperature?: number;
  windowStart?: string;
  windowEnd?: string;
  assessedAt: string;
  disclaimer: string;
}

export interface AlertItem {
  id: string;
  farmId: string;
  animalId?: string;
  animalName?: string;
  deviceId?: string;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

