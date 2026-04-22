'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  { label: 'Turmas',       href: '/turmas',       roles: ['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Pessoas',      href: '/pessoas',      roles: ['ADMINISTRADOR', 'COORDENADOR', 'DIRETOR'] },
  { label: 'Alunos',       href: '/alunos',       roles: ['ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Professores',  href: '/professores',  roles: ['ADMINISTRADOR', 'COORDENADOR'] },
  { label: 'Avaliações',   href: '/avaliacoes',   roles: ['ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Frequências',  href: '/frequencias',  roles: ['ADMINISTRADOR', 'COORDENADOR'] },
  { label: 'Calendário',   href: '/calendario',   roles: ['ADMINISTRADOR', 'COORDENADOR', 'PROFESSOR'] },
  { label: 'Usuários',     href: '/admin/usuarios',   roles: ['ADMINISTRADOR'] },
  { label: 'Instituição',  href: '/admin/instituicao', roles: ['ADMINISTRADOR', 'COORDENADOR'] },
  { label: 'Config. Turma',   href: '/admin/turma',      roles: ['ADMINISTRADOR'] },
  { label: 'Config. Pessoa',  href: '/admin/pessoa',     roles: ['ADMINISTRADOR'] },
  { label: 'Config. Calendário', href: '/admin/calendario', roles: ['ADMINISTRADOR'] },
];

export function Sidebar({ user }: { user: UserMe }) {
  const pathname = usePathname();
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  async function handleLogout() {
    await logout();
    clear();
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

      <Link
        href="/perfil"
        className={cn(
          'flex items-center gap-2 px-2 mb-2 rounded-md py-1 hover:bg-accent transition-colors',
          pathname.startsWith('/perfil') && 'bg-accent'
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user.nome.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.nome}</p>
          <p className="text-xs text-muted-foreground truncate">{user.role}</p>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmLogout(true)}
        className="justify-start"
      >
        Sair
      </Button>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar saída?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e redirecionado para a tela de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
