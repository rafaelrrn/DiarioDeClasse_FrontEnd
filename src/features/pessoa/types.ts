export interface PessoaDTO {
  idPessoa?: number;
  idTipoPessoa: number;
  nome: string;
  sexo?: string;
  dataNascimento?: string; // "YYYY-MM-DD"
  situacao?: string;
  obs?: string;
}

export interface TipoPessoaDTO {
  idTipoPessoa?: number;
  nome: string;
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
