const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8082";

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
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: ApiResponse<T> = await res.json();
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((body as any).message || "Request failed");
  }
  return body.data;
}

export async function apiRegister(req: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<AuthResponse>(res);
}

export async function apiLogin(req: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<AuthResponse>(res);
}
