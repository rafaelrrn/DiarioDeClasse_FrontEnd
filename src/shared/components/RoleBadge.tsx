import type { Role } from '@/features/auth/types';

const ROLE_COLORS: Record<Role, string> = {
  ADMINISTRADOR: 'bg-red-100 text-red-800',
  DIRETOR: 'bg-purple-100 text-purple-800',
  COORDENADOR: 'bg-blue-100 text-blue-800',
  PROFESSOR: 'bg-green-100 text-green-800',
  RESPONSAVEL: 'bg-yellow-100 text-yellow-800',
  ALUNO: 'bg-gray-100 text-gray-800',
};

const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRADOR: 'Administrador',
  DIRETOR: 'Diretor',
  COORDENADOR: 'Coordenador',
  PROFESSOR: 'Professor',
  RESPONSAVEL: 'Responsável',
  ALUNO: 'Aluno',
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-800'}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
