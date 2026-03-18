import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  AlunoAvaliacaoDTO,
  AvaliacaoDTO,
  BoletimResponseDTO,
  NotaLancamentoDTO,
} from './types';

export async function buscarAvaliacoes(): Promise<AvaliacaoDTO[]> {
  const res = await api.get<ApiResponse<AvaliacaoDTO[]>>('/v1/avaliacoes');
  return res.data.data ?? [];
}

export async function criarAvaliacao(payload: AvaliacaoDTO): Promise<AvaliacaoDTO> {
  const res = await api.post<ApiResponse<AvaliacaoDTO>>('/v1/avaliacoes', payload);
  return res.data.data!;
}

export async function atualizarAvaliacao(id: number, payload: AvaliacaoDTO): Promise<AvaliacaoDTO> {
  const res = await api.put<ApiResponse<AvaliacaoDTO>>(`/v1/avaliacoes/${id}`, payload);
  return res.data.data!;
}

export async function deletarAvaliacao(id: number): Promise<void> {
  await api.delete(`/v1/avaliacoes/${id}`);
}

export async function lancarNotas(
  idAvaliacao: number,
  notas: NotaLancamentoDTO[]
): Promise<void> {
  try {
    await api.post(`/v1/avaliacoes/${idAvaliacao}/notas`, notas);
  } catch (error: any) {
    throw new Error(error.response?.data?.error ?? 'Erro ao lançar notas');
  }
}

export async function buscarNotasDoAluno(idAluno: number): Promise<AlunoAvaliacaoDTO[]> {
  const res = await api.get<ApiResponse<AlunoAvaliacaoDTO[]>>(`/v1/alunos/${idAluno}/notas`);
  return res.data.data ?? [];
}

export async function buscarBoletim(idAluno: number): Promise<BoletimResponseDTO | null> {
  const res = await api.get<ApiResponse<BoletimResponseDTO>>(`/v1/alunos/${idAluno}/boletim`);
  return res.data.data;
}
