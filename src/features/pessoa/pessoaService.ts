import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { PessoaDTO } from './types';

export async function buscarPessoas(): Promise<PessoaDTO[]> {
  const res = await api.get<ApiResponse<PessoaDTO[]>>('/v1/pessoas');
  return res.data.data ?? [];
}

export async function buscarPessoa(id: number): Promise<PessoaDTO | null> {
  const res = await api.get<ApiResponse<PessoaDTO>>(`/v1/pessoas/${id}`);
  return res.data.data;
}

export async function criarPessoa(payload: PessoaDTO): Promise<PessoaDTO> {
  const res = await api.post<ApiResponse<PessoaDTO>>('/v1/pessoas', payload);
  return res.data.data!;
}

export async function atualizarPessoa(id: number, payload: PessoaDTO): Promise<PessoaDTO> {
  const res = await api.put<ApiResponse<PessoaDTO>>(`/v1/pessoas/${id}`, payload);
  return res.data.data!;
}

export async function deletarPessoa(id: number): Promise<void> {
  await api.delete(`/v1/pessoas/${id}`);
}
