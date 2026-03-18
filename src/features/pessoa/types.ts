export interface PessoaDTO {
  idPessoa?: number;
  idTipoPessoa: number;
  nome: string;
  sexo?: string;
  dataNascimento?: string;
  situacao?: string;
  obs?: string;
}
