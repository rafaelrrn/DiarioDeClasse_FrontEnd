import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  AlunoFrequenciaDTO,
  FrequenciaResumoDTO,
  LancamentoFrequenciaBody,
  TipoFrequencia,
} from './types';

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

export async function listarFrequencias(): Promise<AlunoFrequenciaDTO[]> {
  const res = await api.get<ApiResponse<AlunoFrequenciaDTO[]>>('/v1/frequencias');
  return res.data.data ?? [];
}

/** Alias de compatibilidade */
export const buscarFrequencias = listarFrequencias;

export async function buscarFrequenciasDoAluno(idAluno: number): Promise<AlunoFrequenciaDTO[]> {
  const res = await api.get<ApiResponse<AlunoFrequenciaDTO[]>>(
    `/v1/frequencias/aluno/${idAluno}`
  );
  return res.data.data ?? [];
}

export async function buscarResumoFrequencia(idAluno: number): Promise<FrequenciaResumoDTO | null> {
  const res = await api.get<ApiResponse<FrequenciaResumoDTO>>(
    `/v1/frequencias/aluno/${idAluno}/resumo`
  );
  return res.data.data ?? null;
}

export async function lancarFrequencia(
  idTurma: number,
  idCalendario: number,
  body: LancamentoFrequenciaBody,
  tipoPadrao: TipoFrequencia = 'PRESENTE'
): Promise<AlunoFrequenciaDTO[]> {
  try {
    const res = await api.post<ApiResponse<AlunoFrequenciaDTO[]>>(
      `/v1/frequencias/turma/${idTurma}/calendario/${idCalendario}`,
      body,
      { params: { tipoPadrao } }
    );
    return res.data.data ?? [];
  } catch (error) {
    extractError(error, 'Erro ao lançar frequência');
  }
}

export async function corrigirFrequencia(
  id: number,
  tipoFrequencia: TipoFrequencia
): Promise<AlunoFrequenciaDTO> {
  try {
    const res = await api.put<ApiResponse<AlunoFrequenciaDTO>>(
      `/v1/frequencias/${id}`,
      { tipoFrequencia }
    );
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao corrigir frequência');
  }
}

export async function desativarFrequencia(id: number): Promise<void> {
  try {
    await api.delete(`/v1/frequencias/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desativar frequência');
  }
}
