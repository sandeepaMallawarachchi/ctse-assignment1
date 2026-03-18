const API_GATEWAY_URL = (
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

const AUTH_SERVICE_URL = `${API_GATEWAY_URL}/api/auth`;

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
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

interface BackendUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
    accessToken: data.token,
    tokenType: data.tokenType,
    userId: data.user.id,
    email: data.user.email,
    fullName,
    roles: data.user.roles ?? [],
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
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(req),
  });
  const body = await handleResponse<BackendAuthResponse>(res);
  return mapAuthResponse(body.data);
}

export async function apiLogin(req: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(req),
  });
  const body = await handleResponse<BackendAuthResponse>(res);
  return mapAuthResponse(body.data);
}
