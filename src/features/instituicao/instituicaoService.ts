import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { InstituicaoDTO } from './types';

export async function buscarInstituicoes(): Promise<InstituicaoDTO[]> {
  const res = await api.get<ApiResponse<InstituicaoDTO[]>>('/v1/instituicoes-ensino');
  return res.data.data ?? [];
}

export async function criarInstituicao(payload: InstituicaoDTO): Promise<InstituicaoDTO> {
  const res = await api.post<ApiResponse<InstituicaoDTO>>('/v1/instituicoes-ensino', payload);
  return res.data.data!;
}

export async function atualizarInstituicao(
  id: number,
  payload: InstituicaoDTO
): Promise<InstituicaoDTO> {
  const res = await api.put<ApiResponse<InstituicaoDTO>>(
    `/v1/instituicoes-ensino/${id}`,
    payload
  );
  return res.data.data!;
}
