import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { AnoCalendarioDTO, CalendarioEscolarDTO, MesDTO, PeriodoDTO } from './types';

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

// ─── CalendarioEscolar ────────────────────────────────────────────────────────

export async function listarCalendarios(): Promise<CalendarioEscolarDTO[]> {
  const res = await api.get<ApiResponse<CalendarioEscolarDTO[]>>('/v1/calendarios-escolares');
  return res.data.data ?? [];
}

/** Alias para compatibilidade com código existente */
export const buscarCalendarios = listarCalendarios;

export async function criarCalendario(
  dto: Omit<CalendarioEscolarDTO, 'idCalendarioEscolar'>
): Promise<CalendarioEscolarDTO> {
  try {
    const res = await api.post<ApiResponse<CalendarioEscolarDTO>>('/v1/calendarios-escolares', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar calendário');
  }
}

export async function atualizarCalendario(
  id: number,
  dto: Omit<CalendarioEscolarDTO, 'idCalendarioEscolar'>
): Promise<CalendarioEscolarDTO> {
  try {
    const res = await api.put<ApiResponse<CalendarioEscolarDTO>>(
      `/v1/calendarios-escolares/${id}`,
      dto
    );
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar calendário');
  }
}

export async function deletarCalendario(id: number): Promise<void> {
  try {
    await api.delete(`/v1/calendarios-escolares/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir calendário');
  }
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

// ─── AnoCalendario ────────────────────────────────────────────────────────────

export async function listarAnosCalendario(): Promise<AnoCalendarioDTO[]> {
  const res = await api.get<ApiResponse<AnoCalendarioDTO[]>>('/v1/anos-calendario');
  return res.data.data ?? [];
}

export async function criarAnoCalendario(
  dto: Omit<AnoCalendarioDTO, 'idAnoCalendario'>
): Promise<AnoCalendarioDTO> {
  try {
    const res = await api.post<ApiResponse<AnoCalendarioDTO>>('/v1/anos-calendario', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar ano calendário');
  }
}

export async function atualizarAnoCalendario(
  id: number,
  dto: Omit<AnoCalendarioDTO, 'idAnoCalendario'>
): Promise<AnoCalendarioDTO> {
  try {
    const res = await api.put<ApiResponse<AnoCalendarioDTO>>(`/v1/anos-calendario/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar ano calendário');
  }
}

export async function deletarAnoCalendario(id: number): Promise<void> {
  try {
    await api.delete(`/v1/anos-calendario/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir ano calendário');
  }
}

// ─── Mes ──────────────────────────────────────────────────────────────────────

export async function listarMeses(): Promise<MesDTO[]> {
  const res = await api.get<ApiResponse<MesDTO[]>>('/v1/meses');
  return res.data.data ?? [];
}

export async function criarMes(dto: Omit<MesDTO, 'idMes'>): Promise<MesDTO> {
  try {
    const res = await api.post<ApiResponse<MesDTO>>('/v1/meses', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar mês');
  }
}

export async function atualizarMes(
  id: number,
  dto: Omit<MesDTO, 'idMes'>
): Promise<MesDTO> {
  try {
    const res = await api.put<ApiResponse<MesDTO>>(`/v1/meses/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar mês');
  }
}

export async function deletarMes(id: number): Promise<void> {
  try {
    await api.delete(`/v1/meses/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir mês');
  }
}

// ─── Periodo ──────────────────────────────────────────────────────────────────

export async function listarPeriodos(): Promise<PeriodoDTO[]> {
  const res = await api.get<ApiResponse<PeriodoDTO[]>>('/v1/periodos');
  return res.data.data ?? [];
}

export async function criarPeriodo(dto: Omit<PeriodoDTO, 'idPeriodo'>): Promise<PeriodoDTO> {
  try {
    const res = await api.post<ApiResponse<PeriodoDTO>>('/v1/periodos', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar período');
  }
}

export async function atualizarPeriodo(
  id: number,
  dto: Omit<PeriodoDTO, 'idPeriodo'>
): Promise<PeriodoDTO> {
  try {
    const res = await api.put<ApiResponse<PeriodoDTO>>(`/v1/periodos/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar período');
  }
}

export async function deletarPeriodo(id: number): Promise<void> {
  try {
    await api.delete(`/v1/periodos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir período');
  }
}
