import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { CalendarioEscolarDTO } from './types';

export async function buscarCalendarios(): Promise<CalendarioEscolarDTO[]> {
  const res = await api.get<ApiResponse<CalendarioEscolarDTO[]>>('/v1/calendarios-escolares');
  return res.data.data ?? [];
}

export async function criarCalendario(payload: CalendarioEscolarDTO): Promise<CalendarioEscolarDTO> {
  const res = await api.post<ApiResponse<CalendarioEscolarDTO>>('/v1/calendarios-escolares', payload);
  return res.data.data!;
}

export async function buscarCalendariosServer(): Promise<CalendarioEscolarDTO[]> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/v1/calendarios-escolares`,
      { headers: { Cookie: `auth_token=${token}` }, cache: 'no-store' }
    );
    const body: ApiResponse<CalendarioEscolarDTO[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}
