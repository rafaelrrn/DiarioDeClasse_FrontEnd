import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  AlunoAvaliacaoDTO,
  AvaliacaoDTO,
  BoletimResponseDTO,
  NotaLancamentoDTO,
} from './types';

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

// ─── Avaliação ────────────────────────────────────────────────────────────────

export async function listarAvaliacoes(): Promise<AvaliacaoDTO[]> {
  const res = await api.get<ApiResponse<AvaliacaoDTO[]>>('/v1/avaliacoes');
  return res.data.data ?? [];
}

/** @deprecated use listarAvaliacoes */
export const buscarAvaliacoes = listarAvaliacoes;

export async function buscarAvaliacao(id: number): Promise<AvaliacaoDTO> {
  const res = await api.get<ApiResponse<AvaliacaoDTO>>(`/v1/avaliacoes/${id}`);
  return res.data.data!;
}

export async function criarAvaliacao(payload: AvaliacaoDTO): Promise<AvaliacaoDTO> {
  try {
    const res = await api.post<ApiResponse<AvaliacaoDTO>>('/v1/avaliacoes', payload);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar avaliação');
  }
}

export async function atualizarAvaliacao(id: number, payload: AvaliacaoDTO): Promise<AvaliacaoDTO> {
  try {
    const res = await api.put<ApiResponse<AvaliacaoDTO>>(`/v1/avaliacoes/${id}`, payload);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar avaliação');
  }
}

export async function desativarAvaliacao(id: number): Promise<void> {
  try {
    await api.delete(`/v1/avaliacoes/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desativar avaliação');
  }
}

/** @deprecated use desativarAvaliacao */
export const deletarAvaliacao = desativarAvaliacao;

// ─── Lançamento em lote ───────────────────────────────────────────────────────

/**
 * Lançamento em lote — transacional.
 * Se qualquer aluno já tiver nota nesta avaliação, a operação INTEIRA falha (HTTP 422).
 */
export async function lancarNotasEmLote(
  idAvaliacao: number,
  notas: NotaLancamentoDTO[]
): Promise<AlunoAvaliacaoDTO[]> {
  try {
    const res = await api.post<ApiResponse<AlunoAvaliacaoDTO[]>>(
      `/v1/avaliacoes/${idAvaliacao}/notas`,
      notas
    );
    return res.data.data ?? [];
  } catch (error) {
    extractError(error, 'Erro ao lançar notas');
  }
}

/** @deprecated use lancarNotasEmLote */
export const lancarNotas = (idAvaliacao: number, notas: NotaLancamentoDTO[]) =>
  lancarNotasEmLote(idAvaliacao, notas);

// ─── AlunoAvaliacao ───────────────────────────────────────────────────────────

export async function listarAlunosAvaliacao(): Promise<AlunoAvaliacaoDTO[]> {
  const res = await api.get<ApiResponse<AlunoAvaliacaoDTO[]>>('/v1/alunos-avaliacao');
  return res.data.data ?? [];
}

export async function corrigirNota(
  id: number,
  nota: number,
  obs?: string
): Promise<AlunoAvaliacaoDTO> {
  try {
    const res = await api.put<ApiResponse<AlunoAvaliacaoDTO>>(
      `/v1/alunos-avaliacao/${id}`,
      { nota, obs }
    );
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao corrigir nota');
  }
}

export async function desativarNota(id: number): Promise<void> {
  try {
    await api.delete(`/v1/alunos-avaliacao/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desativar nota');
  }
}

// ─── Notas e Boletim ──────────────────────────────────────────────────────────

export async function buscarNotasDoAluno(idAluno: number): Promise<AlunoAvaliacaoDTO[]> {
  const res = await api.get<ApiResponse<AlunoAvaliacaoDTO[]>>(`/v1/alunos/${idAluno}/notas`);
  return res.data.data ?? [];
}

export async function buscarBoletim(idAluno: number): Promise<BoletimResponseDTO | null> {
  const res = await api.get<ApiResponse<BoletimResponseDTO>>(`/v1/alunos/${idAluno}/boletim`);
  return res.data.data ?? null;
}
