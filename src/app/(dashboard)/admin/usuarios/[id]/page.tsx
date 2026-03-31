'use client';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsuario, useAtualizarUsuario } from '@/features/auth/authQueries';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useRoles } from '@/shared/hooks/useRoles';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Role } from '@/features/auth/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'DIRETOR', label: 'Diretor' },
  { value: 'COORDENADOR', label: 'Coordenador' },
  { value: 'PROFESSOR', label: 'Professor' },
  { value: 'RESPONSAVEL', label: 'Responsável' },
  { value: 'ALUNO', label: 'Aluno' },
];

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.email('E-mail inválido'),
  senha: z.string().optional(),
  role: z.enum(['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO']),
  idPessoa: z.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const idUsuario = Number(id);
  const router = useRouter();

  const { atLeast } = useRoles();
  const currentUser = useAuthStore((s) => s.user);
  const isSelf = currentUser?.idUser === idUsuario;

  const { data: usuario, isLoading: loadingUsuario, isError: errorUsuario } = useUsuario(idUsuario);
  const { data: pessoas = [] } = usePessoas();
  const atualizar = useAtualizarUsuario();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', senha: '', role: 'ALUNO', idPessoa: null },
  });

  // Preenche o formulário quando os dados carregam
  useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        role: usuario.role,
        idPessoa: usuario.idPessoa ?? null,
      });
    }
  }, [usuario, form]);

  if (!atLeast('ADMINISTRADOR')) {
    return (
      <div>
        <PageHeader title="Editar Usuário" />
        <p className="text-muted-foreground">Acesso restrito ao Administrador.</p>
      </div>
    );
  }

  function onSubmit(data: FormData) {
    atualizar.mutate(
      {
        id: idUsuario,
        payload: {
          nome: data.nome,
          email: data.email,
          senha: data.senha || undefined,
          role: data.role as Role,
          idPessoa: data.idPessoa ?? null,
        },
      },
      { onSuccess: () => router.push('/admin/usuarios') }
    );
  }

  return (
    <div className="max-w-md">
      <PageHeader title="Editar Usuário" />

      {isSelf && (
        <Alert className="mb-4">
          <AlertTitle>Editando sua própria conta</AlertTitle>
          <AlertDescription>
            Alterações de role têm efeito imediato na sua sessão.
          </AlertDescription>
        </Alert>
      )}

      {loadingUsuario ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : errorUsuario || !usuario ? (
        <Alert variant="destructive">
          <AlertTitle>Usuário não encontrado</AlertTitle>
          <AlertDescription>Não foi possível carregar os dados deste usuário.</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="usuario@escola.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha (deixe vazio para manter)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v as Role)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o perfil..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idPessoa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vínculo com Pessoa</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="— Sem vínculo —" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">— Remover vínculo —</SelectItem>
                          {pessoas.map((p) => (
                            <SelectItem key={p.idPessoa} value={String(p.idPessoa)}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={atualizar.isPending}>
                    {atualizar.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/usuarios')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
