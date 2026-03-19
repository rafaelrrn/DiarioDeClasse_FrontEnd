import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  CursoDTO,
  EnsinoDTO,
  GrauDTO,
  InstituicaoEnsinoDTO,
  SerieDTO,
  TurnoDTO,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

// ─── InstituicaoEnsino ────────────────────────────────────────────────────────

export async function listarInstituicoes(): Promise<InstituicaoEnsinoDTO[]> {
  const res = await api.get<ApiResponse<InstituicaoEnsinoDTO[]>>('/v1/instituicoes-ensino');
  return res.data.data ?? [];
}

export async function criarInstituicao(
  dto: Omit<InstituicaoEnsinoDTO, 'idInstituicaoEnsino'>
): Promise<InstituicaoEnsinoDTO> {
  const res = await api.post<ApiResponse<InstituicaoEnsinoDTO>>('/v1/instituicoes-ensino', dto);
  return res.data.data!;
}

export async function atualizarInstituicao(
  id: number,
  dto: Omit<InstituicaoEnsinoDTO, 'idInstituicaoEnsino'>
): Promise<InstituicaoEnsinoDTO> {
  const res = await api.put<ApiResponse<InstituicaoEnsinoDTO>>(
    `/v1/instituicoes-ensino/${id}`,
    dto
  );
  return res.data.data!;
}

export async function deletarInstituicao(id: number): Promise<void> {
  try {
    await api.delete(`/v1/instituicoes-ensino/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir instituição');
  }
}

// ─── Ensino ───────────────────────────────────────────────────────────────────

export async function listarEnsinos(): Promise<EnsinoDTO[]> {
  const res = await api.get<ApiResponse<EnsinoDTO[]>>('/v1/ensinos');
  return res.data.data ?? [];
}

export async function criarEnsino(dto: Omit<EnsinoDTO, 'idEnsino'>): Promise<EnsinoDTO> {
  const res = await api.post<ApiResponse<EnsinoDTO>>('/v1/ensinos', dto);
  return res.data.data!;
}

export async function atualizarEnsino(
  id: number,
  dto: Omit<EnsinoDTO, 'idEnsino'>
): Promise<EnsinoDTO> {
  const res = await api.put<ApiResponse<EnsinoDTO>>(`/v1/ensinos/${id}`, dto);
  return res.data.data!;
}

export async function deletarEnsino(id: number): Promise<void> {
  try {
    await api.delete(`/v1/ensinos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir ensino');
  }
}

// ─── Grau ─────────────────────────────────────────────────────────────────────

export async function listarGraus(): Promise<GrauDTO[]> {
  const res = await api.get<ApiResponse<GrauDTO[]>>('/v1/graus');
  return res.data.data ?? [];
}

export async function criarGrau(dto: Omit<GrauDTO, 'idGrau'>): Promise<GrauDTO> {
  const res = await api.post<ApiResponse<GrauDTO>>('/v1/graus', dto);
  return res.data.data!;
}

export async function atualizarGrau(
  id: number,
  dto: Omit<GrauDTO, 'idGrau'>
): Promise<GrauDTO> {
  const res = await api.put<ApiResponse<GrauDTO>>(`/v1/graus/${id}`, dto);
  return res.data.data!;
}

export async function deletarGrau(id: number): Promise<void> {
  try {
    await api.delete(`/v1/graus/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir grau');
  }
}

// ─── Série ────────────────────────────────────────────────────────────────────

export async function listarSeries(): Promise<SerieDTO[]> {
  const res = await api.get<ApiResponse<SerieDTO[]>>('/v1/series');
  return res.data.data ?? [];
}

export async function criarSerie(dto: Omit<SerieDTO, 'idSerie'>): Promise<SerieDTO> {
  const res = await api.post<ApiResponse<SerieDTO>>('/v1/series', dto);
  return res.data.data!;
}

export async function atualizarSerie(
  id: number,
  dto: Omit<SerieDTO, 'idSerie'>
): Promise<SerieDTO> {
  const res = await api.put<ApiResponse<SerieDTO>>(`/v1/series/${id}`, dto);
  return res.data.data!;
}

export async function deletarSerie(id: number): Promise<void> {
  try {
    await api.delete(`/v1/series/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir série');
  }
}

// ─── Turno ────────────────────────────────────────────────────────────────────

export async function listarTurnos(): Promise<TurnoDTO[]> {
  const res = await api.get<ApiResponse<TurnoDTO[]>>('/v1/turnos');
  return res.data.data ?? [];
}

export async function criarTurno(dto: Omit<TurnoDTO, 'idTurno'>): Promise<TurnoDTO> {
  const res = await api.post<ApiResponse<TurnoDTO>>('/v1/turnos', dto);
  return res.data.data!;
}

export async function atualizarTurno(
  id: number,
  dto: Omit<TurnoDTO, 'idTurno'>
): Promise<TurnoDTO> {
  const res = await api.put<ApiResponse<TurnoDTO>>(`/v1/turnos/${id}`, dto);
  return res.data.data!;
}

export async function deletarTurno(id: number): Promise<void> {
  try {
    await api.delete(`/v1/turnos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir turno');
  }
}

// ─── Curso ────────────────────────────────────────────────────────────────────

export async function listarCursos(): Promise<CursoDTO[]> {
  const res = await api.get<ApiResponse<CursoDTO[]>>('/v1/cursos');
  return res.data.data ?? [];
}

export async function criarCurso(dto: Omit<CursoDTO, 'idCurso'>): Promise<CursoDTO> {
  const res = await api.post<ApiResponse<CursoDTO>>('/v1/cursos', dto);
  return res.data.data!;
}

export async function atualizarCurso(
  id: number,
  dto: Omit<CursoDTO, 'idCurso'>
): Promise<CursoDTO> {
  const res = await api.put<ApiResponse<CursoDTO>>(`/v1/cursos/${id}`, dto);
  return res.data.data!;
}

export async function deletarCurso(id: number): Promise<void> {
  try {
    await api.delete(`/v1/cursos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir curso');
  }
}
