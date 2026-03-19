import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  AlunoTurmaDTO,
  ClasseDTO,
  ComponenteCurricularDTO,
  DisciplinaDTO,
  TurmaDTO,
} from './types';

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

// ─── Turma ────────────────────────────────────────────────────────────────────

export async function listarTurmas(): Promise<TurmaDTO[]> {
  const res = await api.get<ApiResponse<TurmaDTO[]>>('/v1/turmas');
  return res.data.data ?? [];
}

export async function buscarTurma(id: number): Promise<TurmaDTO | null> {
  const res = await api.get<ApiResponse<TurmaDTO>>(`/v1/turmas/${id}`);
  return res.data.data;
}

export async function criarTurma(dto: Omit<TurmaDTO, 'idTurma'>): Promise<TurmaDTO> {
  const res = await api.post<ApiResponse<TurmaDTO>>('/v1/turmas', dto);
  return res.data.data!;
}

export async function atualizarTurma(
  id: number,
  dto: Omit<TurmaDTO, 'idTurma'>
): Promise<TurmaDTO> {
  const res = await api.put<ApiResponse<TurmaDTO>>(`/v1/turmas/${id}`, dto);
  return res.data.data!;
}

export async function deletarTurma(id: number): Promise<void> {
  try {
    await api.delete(`/v1/turmas/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir turma');
  }
}

export async function listarTurmasServer(): Promise<TurmaDTO[]> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return [];
  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/v1/turmas`,
      { headers: { Cookie: `auth_token=${token}` }, cache: 'no-store' }
    );
    const body: ApiResponse<TurmaDTO[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

// ─── AlunoTurma (matrícula) ───────────────────────────────────────────────────

export async function listarAlunosDaTurma(idTurma: number): Promise<AlunoTurmaDTO[]> {
  const res = await api.get<ApiResponse<AlunoTurmaDTO[]>>(`/v1/turmas/${idTurma}/alunos`);
  return res.data.data ?? [];
}

export async function matricularAluno(
  idTurma: number,
  payload: { idAluno: number; obs?: string }
): Promise<AlunoTurmaDTO> {
  try {
    const res = await api.post<ApiResponse<AlunoTurmaDTO>>(
      `/v1/turmas/${idTurma}/alunos`,
      { ...payload, idTurma }
    );
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao matricular aluno');
  }
}

export async function desativarMatricula(idAlunoTurma: number): Promise<void> {
  try {
    await api.delete(`/v1/alunos-turma/${idAlunoTurma}`);
  } catch (error) {
    extractError(error, 'Erro ao desativar matrícula');
  }
}

// ─── Disciplina ───────────────────────────────────────────────────────────────

export async function listarDisciplinas(): Promise<DisciplinaDTO[]> {
  const res = await api.get<ApiResponse<DisciplinaDTO[]>>('/v1/disciplinas');
  return res.data.data ?? [];
}

export async function criarDisciplina(
  dto: Omit<DisciplinaDTO, 'idDisciplina'>
): Promise<DisciplinaDTO> {
  const res = await api.post<ApiResponse<DisciplinaDTO>>('/v1/disciplinas', dto);
  return res.data.data!;
}

export async function atualizarDisciplina(
  id: number,
  dto: Omit<DisciplinaDTO, 'idDisciplina'>
): Promise<DisciplinaDTO> {
  const res = await api.put<ApiResponse<DisciplinaDTO>>(`/v1/disciplinas/${id}`, dto);
  return res.data.data!;
}

export async function deletarDisciplina(id: number): Promise<void> {
  try {
    await api.delete(`/v1/disciplinas/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir disciplina');
  }
}

// ─── ComponenteCurricular ─────────────────────────────────────────────────────

export async function listarComponentesCurriculares(): Promise<ComponenteCurricularDTO[]> {
  const res = await api.get<ApiResponse<ComponenteCurricularDTO[]>>(
    '/v1/componentes-curriculares'
  );
  return res.data.data ?? [];
}

export async function criarComponenteCurricular(
  dto: Omit<ComponenteCurricularDTO, 'idComponenteCurricular'>
): Promise<ComponenteCurricularDTO> {
  const res = await api.post<ApiResponse<ComponenteCurricularDTO>>(
    '/v1/componentes-curriculares',
    dto
  );
  return res.data.data!;
}

export async function atualizarComponenteCurricular(
  id: number,
  dto: Omit<ComponenteCurricularDTO, 'idComponenteCurricular'>
): Promise<ComponenteCurricularDTO> {
  const res = await api.put<ApiResponse<ComponenteCurricularDTO>>(
    `/v1/componentes-curriculares/${id}`,
    dto
  );
  return res.data.data!;
}

export async function deletarComponenteCurricular(id: number): Promise<void> {
  try {
    await api.delete(`/v1/componentes-curriculares/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir componente curricular');
  }
}

// ─── Classe ───────────────────────────────────────────────────────────────────

export async function listarClasses(): Promise<ClasseDTO[]> {
  const res = await api.get<ApiResponse<ClasseDTO[]>>('/v1/classes');
  return res.data.data ?? [];
}

export async function criarClasse(
  dto: Omit<ClasseDTO, 'idClasse'>
): Promise<ClasseDTO> {
  const res = await api.post<ApiResponse<ClasseDTO>>('/v1/classes', dto);
  return res.data.data!;
}

export async function atualizarClasse(
  id: number,
  dto: Omit<ClasseDTO, 'idClasse'>
): Promise<ClasseDTO> {
  const res = await api.put<ApiResponse<ClasseDTO>>(`/v1/classes/${id}`, dto);
  return res.data.data!;
}

export async function deletarClasse(id: number): Promise<void> {
  try {
    await api.delete(`/v1/classes/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir classe');
  }
}

// ─── Aliases para compatibilidade com código legado ──────────────────────────

/** @deprecated Use listarTurmas */
export const buscarTurmas = listarTurmas;
/** @deprecated Use listarAlunosDaTurma */
export const buscarAlunosDaTurma = listarAlunosDaTurma;
/** @deprecated Use listarTurmasServer */
export const buscarTurmasServer = listarTurmasServer;
