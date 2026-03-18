import Link from 'next/link';
import { buttonVariants } from '@/lib/buttonVariants';
import { cn } from '@/lib/utils';

export default function AcessoNegadoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Acesso Negado</h1>
      <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      <Link href="/turmas" className={cn(buttonVariants({ variant: 'outline' }))}>
        Voltar ao início
      </Link>
    </main>
  );
}
