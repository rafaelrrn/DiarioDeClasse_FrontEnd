import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { LoginPayload, RegisterPayload, UserUpdateRequest, UserMe } from './types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

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
  try {
    await api.post<ApiResponse<null>>('/v1/auth/register', payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? 'Erro ao registrar usuário');
  }
}

// ─── Users (ADMINISTRADOR) ────────────────────────────────────────────────────

export async function listarUsuarios(): Promise<UserMe[]> {
  const res = await api.get<ApiResponse<UserMe[]>>('/v1/users');
  return res.data.data ?? [];
}

export async function buscarUsuario(id: number): Promise<UserMe> {
  const res = await api.get<ApiResponse<UserMe>>(`/v1/users/${id}`);
  return res.data.data!;
}

export async function atualizarUsuario(id: number, payload: UserUpdateRequest): Promise<UserMe> {
  try {
    const res = await api.put<ApiResponse<UserMe>>(`/v1/users/${id}`, payload);
    return res.data.data!;
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? 'Erro ao atualizar usuário');
  }
}

// ─── Server-side ──────────────────────────────────────────────────────────────

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
