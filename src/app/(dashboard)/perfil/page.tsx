'use client';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { RoleBadge } from '@/shared/components/RoleBadge';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="space-y-4 max-w-sm">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <PageHeader title="Meu Perfil" />

      <Card>
        <CardHeader className="items-center text-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-2xl">
              {user.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-xl">{user.nome}</CardTitle>
            <RoleBadge role={user.role} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID</span>
            <span className="font-medium">{user.idUser}</span>
          </div>
          {user.idPessoa && (
            <div className="pt-2">
              <Link
                href={`/pessoas/${user.idPessoa}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}
              >
                Ver meu perfil pedagógico
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
