const API_GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

const AUTH_SERVICE_URL = `${API_GATEWAY_URL}/api/auth`;
export const GOOGLE_AUTH_URL = `${AUTH_SERVICE_URL}/google`;

export interface AuthResponse {
  firstName: string;
  lastName: string;
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
  phoneNumber: string | null;
  address: Address | null;
  fullName: string;
  roles: string[];
}

interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  data: T;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Address {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export type UpdateAddressRequest = Address;

export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  roles: string[];
  emailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
}

interface BackendUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  address?: Address | null;
  roles: string[];
}

interface BackendAuthResponse {
  token: string;
  tokenType: string;
  user: BackendUserResponse;
}

function mapAuthResponse(data: BackendAuthResponse): AuthResponse {
  const fullName = [data.user.firstName, data.user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    firstName: data.user.firstName ?? "",
    lastName: data.user.lastName ?? "",
    accessToken: data.token,
    tokenType: data.tokenType,
    userId: data.user.id,
    email: data.user.email,
    phoneNumber: data.user.phoneNumber ?? null,
    address: data.user.address ?? null,
    fullName,
    roles: data.user.roles ?? [],
  };
}

function authHeaders(token?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const body: ApiResponse<T> = await res.json();
  if (!res.ok) {
    const details =
      body.data &&
      typeof body.data === "object" &&
      !Array.isArray(body.data)
        ? Object.values(body.data as Record<string, string>).join(" ")
        : "";
    throw new Error([body.message, details].filter(Boolean).join(": ") || "Request failed");
  }
  return body;
}

export async function apiRegister(req: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/register`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: JSON.stringify(req),
  });
  const body = await handleResponse<BackendAuthResponse>(res);
  return mapAuthResponse(body.data);
}

export async function apiLogin(req: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: JSON.stringify(req),
  });
  const body = await handleResponse<BackendAuthResponse>(res);
  return mapAuthResponse(body.data);
}

export async function apiIssueToken(): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/token`, {
    method: "GET",
    credentials: "include",
  });
  const body = await handleResponse<BackendAuthResponse>(res);
  return mapAuthResponse(body.data);
}

export async function apiLogout(): Promise<void> {
  const res = await fetch(`${AUTH_SERVICE_URL}/logout`, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
  });
  await handleResponse<null>(res);
}

export async function apiGetCurrentUser(token: string): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/me`, {
    method: "GET",
    headers: authHeaders(token),
    credentials: "include",
  });
  const body = await handleResponse<BackendUserResponse>(res);
  return mapAuthResponse({
    token,
    tokenType: "Bearer",
    user: body.data,
  });
}

export async function apiUpdateProfile(
  token: string,
  req: UpdateProfileRequest
): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/profile`, {
    method: "PUT",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify({
      ...req,
      phoneNumber: req.phoneNumber?.trim() ? req.phoneNumber.trim() : "",
    }),
  });
  const body = await handleResponse<BackendUserResponse>(res);
  return mapAuthResponse({
    token,
    tokenType: "Bearer",
    user: body.data,
  });
}

export async function apiUpdateAddress(
  token: string,
  req: UpdateAddressRequest
): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/address`, {
    method: "PUT",
    headers: authHeaders(token),
    credentials: "include",
    body: JSON.stringify(req),
  });
  const body = await handleResponse<BackendUserResponse>(res);
  return mapAuthResponse({
    token,
    tokenType: "Bearer",
    user: body.data,
  });
}

export async function apiGetAdminUsers(token: string): Promise<AdminUserResponse[]> {
  const res = await fetch(`${AUTH_SERVICE_URL}/admin/users`, {
    method: "GET",
    headers: authHeaders(token),
    credentials: "include",
  });
  const body = await handleResponse<AdminUserResponse[]>(res);
  return body.data ?? [];
}
