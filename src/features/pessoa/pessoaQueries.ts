'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listarPessoas,
  buscarPessoa,
  criarPessoa,
  atualizarPessoa,
  deletarPessoa,
  listarTiposPessoa,
  criarTipoPessoa,
  atualizarTipoPessoa,
  deletarTipoPessoa,
  listarAlunosPerfil,
  buscarAlunoPerfilPorPessoa,
  criarAlunoPerfil,
  atualizarAlunoPerfil,
  deletarAlunoPerfil,
  listarProfessoresPerfil,
  buscarProfessorPerfilPorPessoa,
  criarProfessorPerfil,
  atualizarProfessorPerfil,
  deletarProfessorPerfil,
  listarContatos,
  criarContato,
  atualizarContato,
  deletarContato,
  listarContatosPessoa,
  vincularContato,
  atualizarApelidoContatoPessoa,
  desvincularContato,
  listarEnderecos,
  criarEndereco,
  atualizarEndereco,
  deletarEndereco,
  listarEnderecosPessoa,
  vincularEndereco,
  atualizarApelidoEnderecoPessoa,
  desvincularEndereco,
  listarPessoasResponsavel,
  vincularResponsavel,
  atualizarParentesco,
  desvincularResponsavel,
} from './pessoaService';
import type {
  AlunoPerfilDTO,
  ContatoDTO,
  EnderecoDTO,
  PessoaDTO,
  ProfessorPerfilDTO,
  TipoPessoaDTO,
} from './types';

// ─── Pessoa ───────────────────────────────────────────────────────────────────

export function usePessoas() {
  return useQuery({ queryKey: ['pessoas'], queryFn: listarPessoas });
}

export function usePessoa(id: number) {
  return useQuery({ queryKey: ['pessoa', id], queryFn: () => buscarPessoa(id) });
}

export function useCriarPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<PessoaDTO, 'idPessoa'>) => criarPessoa(dto),
    onSuccess: () => {
      toast.success('Pessoa criada com sucesso');
      qc.invalidateQueries({ queryKey: ['pessoas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarPessoa(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<PessoaDTO, 'idPessoa'>) => atualizarPessoa(id, dto),
    onSuccess: () => {
      toast.success('Pessoa atualizada com sucesso');
      qc.invalidateQueries({ queryKey: ['pessoas'] });
      qc.invalidateQueries({ queryKey: ['pessoa', id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarPessoa(id),
    onSuccess: () => {
      toast.success('Pessoa excluída');
      qc.invalidateQueries({ queryKey: ['pessoas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── TipoPessoa ───────────────────────────────────────────────────────────────

export function useTiposPessoa() {
  return useQuery({ queryKey: ['tipos-pessoa'], queryFn: listarTiposPessoa });
}

export function useCriarTipoPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<TipoPessoaDTO, 'idTipoPessoa'>) => criarTipoPessoa(dto),
    onSuccess: () => {
      toast.success('Tipo de pessoa criado com sucesso');
      qc.invalidateQueries({ queryKey: ['tipos-pessoa'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarTipoPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<TipoPessoaDTO, 'idTipoPessoa'> }) =>
      atualizarTipoPessoa(id, dto),
    onSuccess: () => {
      toast.success('Tipo de pessoa atualizado');
      qc.invalidateQueries({ queryKey: ['tipos-pessoa'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarTipoPessoa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarTipoPessoa(id),
    onSuccess: () => {
      toast.success('Tipo de pessoa excluído');
      qc.invalidateQueries({ queryKey: ['tipos-pessoa'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── AlunoPerfil ──────────────────────────────────────────────────────────────

export function useAlunosPerfil() {
  return useQuery({ queryKey: ['aluno-perfil'], queryFn: listarAlunosPerfil });
}

export function useProfessoresPerfil() {
  return useQuery({ queryKey: ['professor-perfil'], queryFn: listarProfessoresPerfil });
}

/** data === null → Pessoa ainda não tem perfil de aluno (404 é estado válido) */
export function useAlunoPerfilPorPessoa(idPessoa: number) {
  return useQuery({
    queryKey: ['aluno-perfil', 'pessoa', idPessoa],
    queryFn: () => buscarAlunoPerfilPorPessoa(idPessoa),
    retry: false,
  });
}

export function useCriarAlunoPerfil(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<AlunoPerfilDTO, 'idAlunoPerfil'>) => criarAlunoPerfil(dto),
    onSuccess: () => {
      toast.success('Perfil de aluno criado com sucesso');
      qc.invalidateQueries({ queryKey: ['aluno-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarAlunoPerfil(id: number, idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<AlunoPerfilDTO, 'idAlunoPerfil' | 'idPessoa'>) =>
      atualizarAlunoPerfil(id, dto),
    onSuccess: () => {
      toast.success('Perfil de aluno atualizado');
      qc.invalidateQueries({ queryKey: ['aluno-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarAlunoPerfil(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarAlunoPerfil(id),
    onSuccess: () => {
      toast.success('Perfil de aluno excluído');
      qc.invalidateQueries({ queryKey: ['aluno-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── ProfessorPerfil ──────────────────────────────────────────────────────────

/** data === null → Pessoa ainda não tem perfil de professor (404 é estado válido) */
export function useProfessorPerfilPorPessoa(idPessoa: number) {
  return useQuery({
    queryKey: ['professor-perfil', 'pessoa', idPessoa],
    queryFn: () => buscarProfessorPerfilPorPessoa(idPessoa),
    retry: false,
  });
}

export function useCriarProfessorPerfil(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ProfessorPerfilDTO, 'idProfessorPerfil'>) => criarProfessorPerfil(dto),
    onSuccess: () => {
      toast.success('Perfil de professor criado com sucesso');
      qc.invalidateQueries({ queryKey: ['professor-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarProfessorPerfil(id: number, idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ProfessorPerfilDTO, 'idProfessorPerfil' | 'idPessoa'>) =>
      atualizarProfessorPerfil(id, dto),
    onSuccess: () => {
      toast.success('Perfil de professor atualizado');
      qc.invalidateQueries({ queryKey: ['professor-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarProfessorPerfil(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarProfessorPerfil(id),
    onSuccess: () => {
      toast.success('Perfil de professor excluído');
      qc.invalidateQueries({ queryKey: ['professor-perfil', 'pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Contato ──────────────────────────────────────────────────────────────────

export function useContatos() {
  return useQuery({ queryKey: ['contatos'], queryFn: listarContatos });
}

export function useCriarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ContatoDTO, 'idContato'>) => criarContato(dto),
    onSuccess: () => {
      toast.success('Contato criado com sucesso');
      qc.invalidateQueries({ queryKey: ['contatos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<ContatoDTO, 'idContato'> }) =>
      atualizarContato(id, dto),
    onSuccess: () => {
      toast.success('Contato atualizado');
      qc.invalidateQueries({ queryKey: ['contatos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarContato() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarContato(id),
    onSuccess: () => {
      toast.success('Contato excluído');
      qc.invalidateQueries({ queryKey: ['contatos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── ContatoPessoa ────────────────────────────────────────────────────────────

export function useContatosPessoa(idPessoa: number) {
  return useQuery({
    queryKey: ['contatos-pessoa', idPessoa],
    queryFn: async () => {
      const all = await listarContatosPessoa();
      return all.filter((cp) => cp.idPessoa === idPessoa);
    },
  });
}

export function useVincularContato(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { idContato: number; nome?: string }) =>
      vincularContato({ idPessoa, ...dto }),
    onSuccess: () => {
      toast.success('Contato vinculado com sucesso');
      qc.invalidateQueries({ queryKey: ['contatos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarApelidoContato(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) =>
      atualizarApelidoContatoPessoa(id, nome),
    onSuccess: () => {
      toast.success('Apelido atualizado');
      qc.invalidateQueries({ queryKey: ['contatos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesvincularContato(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desvincularContato(id),
    onSuccess: () => {
      toast.success('Contato desvinculado');
      qc.invalidateQueries({ queryKey: ['contatos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Endereco ─────────────────────────────────────────────────────────────────

export function useEnderecos() {
  return useQuery({ queryKey: ['enderecos'], queryFn: listarEnderecos });
}

export function useCriarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<EnderecoDTO, 'idEndereco'>) => criarEndereco(dto),
    onSuccess: () => {
      toast.success('Endereço criado com sucesso');
      qc.invalidateQueries({ queryKey: ['enderecos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Omit<EnderecoDTO, 'idEndereco'> }) =>
      atualizarEndereco(id, dto),
    onSuccess: () => {
      toast.success('Endereço atualizado');
      qc.invalidateQueries({ queryKey: ['enderecos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletarEndereco(id),
    onSuccess: () => {
      toast.success('Endereço excluído');
      qc.invalidateQueries({ queryKey: ['enderecos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── EnderecoPessoa ───────────────────────────────────────────────────────────

export function useEnderecosPessoa(idPessoa: number) {
  return useQuery({
    queryKey: ['enderecos-pessoa', idPessoa],
    queryFn: async () => {
      const all = await listarEnderecosPessoa();
      return all.filter((ep) => ep.idPessoa === idPessoa);
    },
  });
}

export function useVincularEndereco(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { idEndereco: number; nome?: string }) =>
      vincularEndereco({ idPessoa, ...dto }),
    onSuccess: () => {
      toast.success('Endereço vinculado com sucesso');
      qc.invalidateQueries({ queryKey: ['enderecos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarApelidoEndereco(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) =>
      atualizarApelidoEnderecoPessoa(id, nome),
    onSuccess: () => {
      toast.success('Apelido atualizado');
      qc.invalidateQueries({ queryKey: ['enderecos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesvincularEndereco(idPessoa: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desvincularEndereco(id),
    onSuccess: () => {
      toast.success('Endereço desvinculado');
      qc.invalidateQueries({ queryKey: ['enderecos-pessoa', idPessoa] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── PessoaResponsavel ────────────────────────────────────────────────────────

export function useResponsaveisDoAluno(idAluno: number) {
  return useQuery({
    queryKey: ['pessoas-responsavel', idAluno],
    queryFn: async () => {
      const all = await listarPessoasResponsavel();
      return all.filter((pr) => pr.idAluno === idAluno);
    },
  });
}

export function useVincularResponsavel(idAluno: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { idResponsavel: number; parentesco?: string }) =>
      vincularResponsavel({ idAluno, ...dto }),
    onSuccess: () => {
      toast.success('Responsável vinculado com sucesso');
      qc.invalidateQueries({ queryKey: ['pessoas-responsavel', idAluno] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAtualizarParentesco(idAluno: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parentesco }: { id: number; parentesco: string }) =>
      atualizarParentesco(id, parentesco),
    onSuccess: () => {
      toast.success('Parentesco atualizado');
      qc.invalidateQueries({ queryKey: ['pessoas-responsavel', idAluno] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDesvincularResponsavel(idAluno: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desvincularResponsavel(id),
    onSuccess: () => {
      toast.success('Responsável desvinculado');
      qc.invalidateQueries({ queryKey: ['pessoas-responsavel', idAluno] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
