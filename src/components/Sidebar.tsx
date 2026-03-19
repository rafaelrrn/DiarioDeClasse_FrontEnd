'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { logout } from '@/features/auth/authService';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { UserMe } from '@/features/auth/types';
import type { Role } from '@/features/auth/types';

interface NavItem {
  label: string;
  href: string;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { label: 'Turmas', href: '/turmas', roles: ['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Alunos', href: '/alunos' },
  { label: 'Avaliações', href: '/avaliacoes', roles: ['ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Calendário', href: '/calendario', roles: ['ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Usuários', href: '/admin/usuarios', roles: ['ADMINISTRADOR'] },
  { label: 'Instituição', href: '/admin/instituicao', roles: ['ADMINISTRADOR', 'COORDENADOR'] },
  { label: 'Config. Turma', href: '/admin/turma', roles: ['ADMINISTRADOR'] },
];

export function Sidebar({ user }: { user: UserMe }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push('/login');
  }

  return (
    <aside className="w-56 border-r bg-card flex flex-col py-4 px-3">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold">DiárioDigital</h1>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {visible.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Separator className="my-3" />

      <div className="flex items-center gap-2 px-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user.nome.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.nome}</p>
          <p className="text-xs text-muted-foreground truncate">{user.role}</p>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start">
        Sair
      </Button>
    </aside>
  );
}
