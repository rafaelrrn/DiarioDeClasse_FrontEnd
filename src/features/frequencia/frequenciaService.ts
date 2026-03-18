import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  AlunoFrequenciaDTO,
  FrequenciaResumoDTO,
  LancamentoFrequenciaBody,
  TipoFrequencia,
} from './types';

export async function buscarFrequencias(): Promise<AlunoFrequenciaDTO[]> {
  const res = await api.get<ApiResponse<AlunoFrequenciaDTO[]>>('/v1/frequencias');
  return res.data.data ?? [];
}

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
  return res.data.data;
}

export async function lancarFrequencia(
  idTurma: number,
  idCalendario: number,
  body: LancamentoFrequenciaBody,
  tipoPadrao: TipoFrequencia = 'PRESENTE'
): Promise<AlunoFrequenciaDTO[]> {
  const res = await api.post<ApiResponse<AlunoFrequenciaDTO[]>>(
    `/v1/frequencias/turma/${idTurma}/calendario/${idCalendario}`,
    body,
    { params: { tipoPadrao } }
  );
  return res.data.data ?? [];
}

export async function atualizarFrequencia(
  id: number,
  payload: Partial<AlunoFrequenciaDTO>
): Promise<AlunoFrequenciaDTO> {
  const res = await api.put<ApiResponse<AlunoFrequenciaDTO>>(
    `/v1/frequencias/${id}`,
    payload
  );
  return res.data.data!;
}
