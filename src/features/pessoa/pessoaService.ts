import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type {
  ContatoDTO,
  ContatoPessoaDTO,
  EnderecoDTO,
  EnderecoPessoaDTO,
  PessoaDTO,
  PessoaResponsavelDTO,
  TipoPessoaDTO,
} from './types';

function extractError(error: unknown, fallback: string): never {
  const msg = (error as any)?.response?.data?.error ?? fallback;
  throw new Error(msg);
}

// ─── Pessoa ───────────────────────────────────────────────────────────────────

export async function listarPessoas(): Promise<PessoaDTO[]> {
  const res = await api.get<ApiResponse<PessoaDTO[]>>('/v1/pessoas');
  return res.data.data ?? [];
}

/** Alias para compatibilidade com código existente */
export const buscarPessoas = listarPessoas;

export async function buscarPessoa(id: number): Promise<PessoaDTO> {
  const res = await api.get<ApiResponse<PessoaDTO>>(`/v1/pessoas/${id}`);
  return res.data.data!;
}

export async function criarPessoa(dto: Omit<PessoaDTO, 'idPessoa'>): Promise<PessoaDTO> {
  try {
    const res = await api.post<ApiResponse<PessoaDTO>>('/v1/pessoas', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar pessoa');
  }
}

export async function atualizarPessoa(
  id: number,
  dto: Omit<PessoaDTO, 'idPessoa'>
): Promise<PessoaDTO> {
  try {
    const res = await api.put<ApiResponse<PessoaDTO>>(`/v1/pessoas/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar pessoa');
  }
}

export async function deletarPessoa(id: number): Promise<void> {
  try {
    await api.delete(`/v1/pessoas/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir pessoa');
  }
}

// ─── TipoPessoa ───────────────────────────────────────────────────────────────

export async function listarTiposPessoa(): Promise<TipoPessoaDTO[]> {
  const res = await api.get<ApiResponse<TipoPessoaDTO[]>>('/v1/tipos-pessoa');
  return res.data.data ?? [];
}

export async function criarTipoPessoa(dto: Omit<TipoPessoaDTO, 'idTipoPessoa'>): Promise<TipoPessoaDTO> {
  try {
    const res = await api.post<ApiResponse<TipoPessoaDTO>>('/v1/tipos-pessoa', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar tipo de pessoa');
  }
}

export async function atualizarTipoPessoa(
  id: number,
  dto: Omit<TipoPessoaDTO, 'idTipoPessoa'>
): Promise<TipoPessoaDTO> {
  try {
    const res = await api.put<ApiResponse<TipoPessoaDTO>>(`/v1/tipos-pessoa/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar tipo de pessoa');
  }
}

export async function deletarTipoPessoa(id: number): Promise<void> {
  try {
    await api.delete(`/v1/tipos-pessoa/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir tipo de pessoa');
  }
}

// ─── Contato ──────────────────────────────────────────────────────────────────

export async function listarContatos(): Promise<ContatoDTO[]> {
  const res = await api.get<ApiResponse<ContatoDTO[]>>('/v1/contatos');
  return res.data.data ?? [];
}

export async function criarContato(dto: Omit<ContatoDTO, 'idContato'>): Promise<ContatoDTO> {
  try {
    const res = await api.post<ApiResponse<ContatoDTO>>('/v1/contatos', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar contato');
  }
}

export async function atualizarContato(
  id: number,
  dto: Omit<ContatoDTO, 'idContato'>
): Promise<ContatoDTO> {
  try {
    const res = await api.put<ApiResponse<ContatoDTO>>(`/v1/contatos/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar contato');
  }
}

export async function deletarContato(id: number): Promise<void> {
  try {
    await api.delete(`/v1/contatos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir contato');
  }
}

// ─── ContatoPessoa ────────────────────────────────────────────────────────────

export async function listarContatosPessoa(): Promise<ContatoPessoaDTO[]> {
  const res = await api.get<ApiResponse<ContatoPessoaDTO[]>>('/v1/contatos-pessoa');
  return res.data.data ?? [];
}

export async function vincularContato(dto: {
  idPessoa: number;
  idContato: number;
  nome?: string;
}): Promise<ContatoPessoaDTO> {
  try {
    const res = await api.post<ApiResponse<ContatoPessoaDTO>>('/v1/contatos-pessoa', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao vincular contato');
  }
}

export async function atualizarApelidoContatoPessoa(
  id: number,
  nome: string
): Promise<ContatoPessoaDTO> {
  try {
    const res = await api.put<ApiResponse<ContatoPessoaDTO>>(`/v1/contatos-pessoa/${id}`, { nome });
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar apelido do contato');
  }
}

export async function desvincularContato(id: number): Promise<void> {
  try {
    await api.delete(`/v1/contatos-pessoa/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desvincular contato');
  }
}

// ─── Endereco ─────────────────────────────────────────────────────────────────

export async function listarEnderecos(): Promise<EnderecoDTO[]> {
  const res = await api.get<ApiResponse<EnderecoDTO[]>>('/v1/enderecos');
  return res.data.data ?? [];
}

export async function criarEndereco(dto: Omit<EnderecoDTO, 'idEndereco'>): Promise<EnderecoDTO> {
  try {
    const res = await api.post<ApiResponse<EnderecoDTO>>('/v1/enderecos', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao criar endereço');
  }
}

export async function atualizarEndereco(
  id: number,
  dto: Omit<EnderecoDTO, 'idEndereco'>
): Promise<EnderecoDTO> {
  try {
    const res = await api.put<ApiResponse<EnderecoDTO>>(`/v1/enderecos/${id}`, dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar endereço');
  }
}

export async function deletarEndereco(id: number): Promise<void> {
  try {
    await api.delete(`/v1/enderecos/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao excluir endereço');
  }
}

// ─── EnderecoPessoa ───────────────────────────────────────────────────────────

export async function listarEnderecosPessoa(): Promise<EnderecoPessoaDTO[]> {
  const res = await api.get<ApiResponse<EnderecoPessoaDTO[]>>('/v1/enderecos-pessoa');
  return res.data.data ?? [];
}

export async function vincularEndereco(dto: {
  idPessoa: number;
  idEndereco: number;
  nome?: string;
}): Promise<EnderecoPessoaDTO> {
  try {
    const res = await api.post<ApiResponse<EnderecoPessoaDTO>>('/v1/enderecos-pessoa', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao vincular endereço');
  }
}

export async function atualizarApelidoEnderecoPessoa(
  id: number,
  nome: string
): Promise<EnderecoPessoaDTO> {
  try {
    const res = await api.put<ApiResponse<EnderecoPessoaDTO>>(`/v1/enderecos-pessoa/${id}`, { nome });
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar apelido do endereço');
  }
}

export async function desvincularEndereco(id: number): Promise<void> {
  try {
    await api.delete(`/v1/enderecos-pessoa/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desvincular endereço');
  }
}

// ─── PessoaResponsavel ────────────────────────────────────────────────────────

export async function listarPessoasResponsavel(): Promise<PessoaResponsavelDTO[]> {
  const res = await api.get<ApiResponse<PessoaResponsavelDTO[]>>('/v1/pessoas-responsavel');
  return res.data.data ?? [];
}

export async function vincularResponsavel(dto: {
  idAluno: number;
  idResponsavel: number;
  parentesco?: string;
}): Promise<PessoaResponsavelDTO> {
  try {
    const res = await api.post<ApiResponse<PessoaResponsavelDTO>>('/v1/pessoas-responsavel', dto);
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao vincular responsável');
  }
}

export async function atualizarParentesco(
  id: number,
  parentesco: string
): Promise<PessoaResponsavelDTO> {
  try {
    const res = await api.put<ApiResponse<PessoaResponsavelDTO>>(
      `/v1/pessoas-responsavel/${id}`,
      { parentesco }
    );
    return res.data.data!;
  } catch (error) {
    extractError(error, 'Erro ao atualizar parentesco');
  }
}

export async function desvincularResponsavel(id: number): Promise<void> {
  try {
    await api.delete(`/v1/pessoas-responsavel/${id}`);
  } catch (error) {
    extractError(error, 'Erro ao desvincular responsável');
  }
}
