import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { LoginPayload, RegisterPayload, UserMe } from './types';

export async function login(payload: LoginPayload): Promise<void> {
  await api.post<ApiResponse<null>>('/v1/auth/login', payload);
}

export async function logout(): Promise<void> {
  await api.post<ApiResponse<null>>('/v1/auth/logout');
}

export async function buscarMe(): Promise<UserMe | null> {
  const res = await api.get<ApiResponse<UserMe>>('/v1/auth/me');
  return res.data.data;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await api.post<ApiResponse<null>>('/v1/auth/register', payload);
}

export async function buscarMeServer(): Promise<UserMe | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/v1/auth/me`,
      {
        headers: { Cookie: `auth_token=${token}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) return null;

    const body: ApiResponse<UserMe> = await res.json();
    return body.data;
  } catch {
    return null;
  }
}
