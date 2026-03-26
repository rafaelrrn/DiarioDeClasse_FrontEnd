'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { register } from '@/features/auth/authService';
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
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z
    .enum(['ADMINISTRADOR', 'DIRETOR', 'COORDENADOR', 'PROFESSOR', 'RESPONSAVEL', 'ALUNO'])
    .optional()
    .refine((val) => val !== undefined, {
      message: 'Role é obrigatória',
    }),
});

type FormData = z.infer<typeof schema>;

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { atLeast } = useRoles();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      role: undefined,
    }
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
        ...data,
        role: data.role,
      });
      toast.success('Usuário registrado com sucesso');
      router.push('/admin/usuarios');
    } catch (error: any) {
      const msg = error.response?.data?.error ?? 'Erro ao registrar usuário';
      toast.error(msg);
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
                label="Role"
                placeholder="Selecione o perfil..."
                options={ROLE_OPTIONS}
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
