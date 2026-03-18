import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { AlunoTurmaDTO, TurmaDTO } from './types';

export async function buscarTurmas(): Promise<TurmaDTO[]> {
  const res = await api.get<ApiResponse<TurmaDTO[]>>('/v1/turmas');
  return res.data.data ?? [];
}

export async function buscarTurma(id: number): Promise<TurmaDTO | null> {
  const res = await api.get<ApiResponse<TurmaDTO>>(`/v1/turmas/${id}`);
  return res.data.data;
}

export async function buscarAlunosDaTurma(idTurma: number): Promise<AlunoTurmaDTO[]> {
  const res = await api.get<ApiResponse<AlunoTurmaDTO[]>>(`/v1/turmas/${idTurma}/alunos`);
  return res.data.data ?? [];
}

export async function criarTurma(payload: TurmaDTO): Promise<TurmaDTO> {
  const res = await api.post<ApiResponse<TurmaDTO>>('/v1/turmas', payload);
  return res.data.data!;
}

export async function atualizarTurma(id: number, payload: TurmaDTO): Promise<TurmaDTO> {
  const res = await api.put<ApiResponse<TurmaDTO>>(`/v1/turmas/${id}`, payload);
  return res.data.data!;
}

export async function deletarTurma(id: number): Promise<void> {
  await api.delete(`/v1/turmas/${id}`);
}

export async function matricularAluno(
  idTurma: number,
  payload: { idAluno: number; obs?: string }
): Promise<void> {
  try {
    await api.post(`/v1/turmas/${idTurma}/alunos`, { ...payload, idTurma });
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? 'Erro ao matricular aluno');
  }
}

export async function buscarTurmasServer(): Promise<TurmaDTO[]> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL ?? 'http://localhost:8080/api'}/v1/turmas`,
      {
        headers: { Cookie: `auth_token=${token}` },
        cache: 'no-store',
      }
    );
    const body: ApiResponse<TurmaDTO[]> = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}
