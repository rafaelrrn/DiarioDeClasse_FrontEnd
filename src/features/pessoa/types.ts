export const SEXO_OPTIONS = [
  { value: 'M',  label: 'Masculino'     },
  { value: 'F',  label: 'Feminino'      },
  { value: 'NB', label: 'Não-binário'   },
  { value: 'NI', label: 'Não-informado' },
] as const;

export const SITUACAO_OPTIONS = [
  { value: 'ATIVO',       label: 'Ativo'       },
  { value: 'INATIVO',     label: 'Inativo'     },
  { value: 'TRANSFERIDO', label: 'Transferido' },
  { value: 'EVADIDO',     label: 'Evadido'     },
  { value: 'FORMADO',     label: 'Formado'     },
] as const;

export type SexoCode     = typeof SEXO_OPTIONS[number]['value'];
export type SituacaoCode = typeof SITUACAO_OPTIONS[number]['value'];

export interface PessoaDTO {
  idPessoa?: number;
  idTipoPessoa: number;       // obrigatório — FK para TipoPessoa
  nome: string;               // obrigatório, max 255
  cpf?: string;               // opcional, 11 dígitos numéricos (sem máscara)
  sexo?: SexoCode;            // 'M' | 'F' | 'NB' | 'NI'
  dataNascimento?: string;    // "YYYY-MM-DD"
  situacao?: SituacaoCode;    // 'ATIVO' | 'INATIVO' | 'TRANSFERIDO' | 'EVADIDO' | 'FORMADO'
  fotoUrl?: string;           // opcional, max 500
  obs?: string;               // max 255
}

export interface TipoPessoaDTO {
  idTipoPessoa?: number;
  nome: string;
}

export interface AlunoPerfilDTO {
  idAlunoPerfil?: number;
  idPessoa: number;
  matricula: string;         // obrigatório, max 30
  dataMatricula: string;     // "YYYY-MM-DD"
  necessidadeEspecial: boolean;
  descricaoNee?: string;
}

export interface ProfessorPerfilDTO {
  idProfessorPerfil?: number;
  idPessoa: number;
  registroMec?: string;  // max 30
  formacao?: string;     // max 200
  dataAdmissao: string;  // "YYYY-MM-DD"
}

export interface ContatoDTO {
  idContato?: number;
  tipoContato: string;
  contato: string;
}

export interface ContatoPessoaDTO {
  idContatoPessoa?: number;
  idPessoa: number;
  idContato: number;
  nome?: string;
}

export interface EnderecoDTO {
  idEndereco?: number;
  uf?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  complemento?: string;
}

export interface EnderecoPessoaDTO {
  idEnderecoPessoa?: number;
  idPessoa: number;
  idEndereco: number;
  nome?: string;
}

export interface PessoaResponsavelDTO {
  idPessoaResponsavel?: number;
  idAluno: number;
  idResponsavel: number;
  parentesco?: string;
}
