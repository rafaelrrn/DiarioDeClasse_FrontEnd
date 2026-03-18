export type Role =
  | 'ADMINISTRADOR'
  | 'DIRETOR'
  | 'COORDENADOR'
  | 'PROFESSOR'
  | 'ALUNO'
  | 'RESPONSAVEL';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

export interface UserMe {
  idUsers: number;
  email: string;
  nome: string;
  role: Role;
}
