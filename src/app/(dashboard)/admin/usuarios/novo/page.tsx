'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { register } from '@/features/auth/authService';
import { userKeys } from '@/features/auth/authQueries';
import { usePessoas } from '@/features/pessoa/pessoaQueries';
import { useRoles } from '@/shared/hooks/useRoles';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import type { Role } from '@/features/auth/types';
import { SelectField } from '@/components/form/SelectField';

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
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
<<<<<<< Updated upstream
  role: z
    .enum(['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'])
    .optional()
    .refine((val) => val !== undefined, {
      message: 'Role é obrigatória',
    }),
=======
  role: z.enum(['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO']),
  idPessoa: z.number().optional().nullable(),
>>>>>>> Stashed changes
});

type FormData = z.infer<typeof schema>;

export default function NovoUsuarioPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { atLeast } = useRoles();
  const { data: pessoas = [] } = usePessoas();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
<<<<<<< Updated upstream
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      role: undefined,
    }
=======
    defaultValues: { idPessoa: null },
>>>>>>> Stashed changes
  });

  if (!atLeast('ADMINISTRADOR')) {
    return (
      <div>
        <PageHeader title="Novo Usuário" />
        <p className="text-muted-foreground">Acesso restrito ao Administrador.</p>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    if (!data.role) return;

    try {
      await register({
<<<<<<< Updated upstream
        ...data,
        role: data.role,
=======
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role as Role,
        idPessoa: data.idPessoa ?? null,
>>>>>>> Stashed changes
      });
      toast.success('Usuário registrado com sucesso');
      qc.invalidateQueries({ queryKey: userKeys.all });
      router.push('/admin/usuarios');
    } catch (error: any) {
      toast.error(error.message ?? 'Erro ao registrar usuário');
    }
  }

  return (
    <div className="max-w-md">
      <PageHeader title="Novo Usuário" />

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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SelectField
                control={form.control}
                name="role"
<<<<<<< Updated upstream
                label="Role"
                placeholder="Selecione o perfil..."
                options={ROLE_OPTIONS}
=======
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
>>>>>>> Stashed changes
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
                        <SelectItem value="">— Sem vínculo —</SelectItem>
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Registrando...' : 'Registrar'}
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
    </div>
  );
}
