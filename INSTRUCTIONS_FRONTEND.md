# INSTRUCTIONS.md — DiárioDigital Frontend
> Este arquivo é o guia de referência para o Claude Code no projeto frontend.
> Leia este arquivo integralmente antes de qualquer ação no projeto.

---

## 1. Visão Geral do Projeto

**Nome:** DiárioDigital — Frontend
**Objetivo:** Interface web para o sistema de gestão escolar da rede municipal de Cruzeiro/SP.
**Backend:** API REST em Spring Boot, rodando em `http://localhost:8080/api` (local) ou variável de ambiente.
**Problema resolvido:** Professores precisam de uma interface amigável para lançar frequência, notas e acompanhar o boletim dos alunos. Gestores precisam de dashboards para monitorar turmas, calendários e situação dos alunos.

**Stack do Frontend:**
- Linguagem: TypeScript
- Framework: Next.js 14+ (App Router) + React 18
- Estilização: Tailwind CSS + shadcn/ui
- Gerenciamento de estado: Zustand (estado global leve) + TanStack Query (cache de server state)
- Formulários: React Hook Form + Zod (validação)
- Cliente HTTP: Axios (com interceptors para cookie/erros)
- Testes: Jest + React Testing Library
- Deploy: Vercel (integrado ao GitHub)
- Build: Next.js (built-in)

---

## 2. Arquitetura Obrigatória

### 2.1 Padrão: App Router (Next.js) + Feature-Based

A estrutura combina o **App Router do Next.js** (roteamento por pastas em `app/`) com uma camada de **features** (lógica de negócio isolada por domínio, espelhando o backend).

```
src/
│
├── app/                              ← Roteamento Next.js (App Router)
│   ├── layout.tsx                    ← Layout raiz (providers globais)
│   ├── page.tsx                      ← Redireciona para /login ou /dashboard
│   │
│   ├── (auth)/                       ← Route group — sem sidebar
│   │   └── login/
│   │       └── page.tsx
│   │
│   └── (dashboard)/                  ← Route group — com sidebar
│       ├── layout.tsx                ← Sidebar + header comuns
│       ├── page.tsx                  ← Redireciona para rota default do role
│       │
│       ├── turmas/
│       │   ├── page.tsx              ← Lista de turmas
│       │   └── [id]/
│       │       ├── page.tsx          ← Detalhe da turma + alunos
│       │       └── frequencia/
│       │           └── page.tsx      ← Lançar frequência na turma
│       │
│       ├── alunos/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── boletim/
│       │           └── page.tsx      ← Boletim do aluno
│       │
│       ├── avaliacoes/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── notas/
│       │           └── page.tsx      ← Lançar notas em lote
│       │
│       ├── calendario/
│       │   └── page.tsx
│       │
│       └── admin/                    ← Apenas ADMINISTRADOR
│           ├── usuarios/
│           ├── instituicao/
│           └── turmas/
│
├── features/                         ← Lógica de negócio por domínio
│   ├── auth/
│   │   ├── authService.ts            ← Chamadas à API
│   │   ├── useAuthStore.ts           ← Store Zustand com user logado
│   │   └── types.ts
│   │
│   ├── turma/
│   │   ├── turmaService.ts
│   │   ├── turmaQueries.ts           ← useQuery / useMutation
│   │   └── types.ts
│   │
│   ├── frequencia/
│   │   ├── frequenciaService.ts
│   │   ├── frequenciaQueries.ts
│   │   └── types.ts
│   │
│   ├── avaliacao/
│   ├── pessoa/
│   ├── calendario/
│   └── instituicao/
│
├── shared/
│   ├── api/
│   │   ├── axiosInstance.ts          ← Axios configurado com baseURL e interceptors
│   │   └── types.ts                  ← ApiResponse<T>
│   ├── components/
│   │   ├── SituacaoBadge.tsx         ← Badge colorido para SituacaoAluno
│   │   ├── FrequenciaBadge.tsx       ← Badge para risco de reprovação
│   │   ├── PageHeader.tsx
│   │   └── DataTable.tsx             ← Tabela wrapper sobre shadcn/ui Table
│   └── hooks/
│       └── useRoles.ts               ← Verifica roles do usuário logado
│
└── middleware.ts                     ← Auth guard no edge (Next.js Middleware)
```

### 2.2 Server Components vs Client Components

O App Router do Next.js usa **Server Components por padrão**. Seguir estas regras:

| Situação | Tipo |
|----------|------|
| Apenas renderização / leitura de dados | Server Component (padrão) |
| Usa `useState`, `useEffect`, hooks | `'use client'` |
| Formulários interativos | `'use client'` |
| Acessa store Zustand | `'use client'` |
| Lançamento de frequência / notas | `'use client'` |

```typescript
// Server Component — não precisa declarar nada, é o padrão
export default async function TurmaListPage() {
  const turmas = await buscarTurmasServer(); // fetch direto, sem axios
  return <TurmaTable turmas={turmas} />;
}

// Client Component — declarar explicitamente
'use client';
export function FrequenciaForm() {
  const [tipo, setTipo] = useState<TipoFrequencia>('PRESENTE');
  // ...
}
```

---

## 3. Autenticação — Cookie JWT

### 3.1 Como funciona no backend

A autenticação é baseada em **cookie HttpOnly** chamado `auth_token`.

```
POST /api/v1/auth/login   →  define cookie auth_token (HttpOnly, Path=/)
GET  /api/v1/auth/me      →  lê cookie e retorna dados do usuário logado
POST /api/v1/auth/logout  →  zera o cookie (maxAge=0)
POST /api/v1/auth/register → cria novo usuário
```

### 3.2 Middleware de autenticação (Next.js Edge)

O guard principal fica em `middleware.ts` na raiz do projeto. É executado antes de qualquer página — sem overhead de componente:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const isPublic = PUBLIC_PATHS.some(p => request.nextUrl.pathname.startsWith(p));

  // Redireciona para login se não autenticado e não é rota pública
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redireciona para dashboard se já autenticado e tenta acessar /login
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Aplica o middleware em todas as rotas, exceto assets estáticos
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 3.3 Configuração obrigatória do Axios (Client Components)

```typescript
// src/shared/api/axiosInstance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api',
  withCredentials: true,  // ← OBRIGATÓRIO — envia o cookie auth_token automaticamente
});

// Redireciona para /login em caso de 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3.4 Chamadas server-side (Server Components)

Para Server Components que precisam buscar dados autenticados, encaminhar o cookie do request:

```typescript
// src/features/turma/turmaService.ts — versão server-side
import { cookies } from 'next/headers';

export async function buscarTurmasServer() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  const res = await fetch(`${process.env.API_URL}/v1/turmas`, {
    headers: { Cookie: `auth_token=${token}` },
    cache: 'no-store', // dados em tempo real — não cachear
  });

  const body = await res.json();
  return body.data ?? [];
}
```

> **Variáveis de ambiente:**
> - `NEXT_PUBLIC_API_URL` — usada no browser (Client Components, Axios)
> - `API_URL` — usada apenas no servidor (Server Components, não exposta ao browser)

### 3.5 Store Zustand do usuário logado

```typescript
// src/features/auth/useAuthStore.ts
'use client';
import { create } from 'zustand';
import type { UserMe } from './types';

interface AuthState {
  user: UserMe | null;
  setUser: (user: UserMe | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

O store é populado após o login chamando `GET /v1/auth/me` e salvo via `setUser(data)`.

### 3.6 Tipos do módulo Auth

```typescript
// src/features/auth/types.ts

export type Role =
  | 'ADMINISTRADOR'
  | 'DIRETOR'
  | 'COORDENADOR'
  | 'PROFESSOR'
  | 'ALUNO'
  | 'RESPONSAVEL';

export interface LoginPayload { email: string; senha: string; }

export interface RegisterPayload { nome: string; email: string; senha: string; role: Role; }

export interface UserMe { idUsers: number; email: string; nome: string; role: Role; }
```

---

## 4. shadcn/ui — Setup e Componentes

### 4.1 Instalação inicial

```bash
npx shadcn@latest init
# Escolher: TypeScript, Tailwind, App Router, src/
```

### 4.2 Componentes prioritários para instalar

```bash
npx shadcn@latest add button input label card table badge dialog
npx shadcn@latest add select textarea form toast separator
npx shadcn@latest add dropdown-menu avatar sidebar navigation-menu
```

### 4.3 Como usar — nunca reimplementar o que o shadcn já oferece

```typescript
// ✅ CORRETO — usar shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ❌ ERRADO — criar botão, input ou tabela do zero
```

### 4.4 Componentes customizados sobre shadcn

Criar wrappers apenas para lógica de negócio específica do sistema:

```typescript
// src/shared/components/SituacaoBadge.tsx
import { Badge } from '@/components/ui/badge';
import type { SituacaoAluno } from '@/features/avaliacao/types';

const config: Record<SituacaoAluno, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  APROVADO:               { label: 'Aprovado',           variant: 'default' },
  EM_RECUPERACAO:         { label: 'Em Recuperação',     variant: 'secondary' },
  REPROVADO_NOTA:         { label: 'Reprovado (Nota)',   variant: 'destructive' },
  REPROVADO_FREQUENCIA:   { label: 'Reprovado (Freq.)',  variant: 'destructive' },
};

export function SituacaoBadge({ situacao }: { situacao: SituacaoAluno }) {
  const { label, variant } = config[situacao];
  return <Badge variant={variant}>{label}</Badge>;
}
```

```typescript
// src/shared/components/FrequenciaBadge.tsx
import { Badge } from '@/components/ui/badge';

export function FrequenciaBadge({ percentual, emRisco }: { percentual: number; emRisco: boolean }) {
  return (
    <Badge variant={emRisco ? 'destructive' : 'default'}>
      {percentual.toFixed(1)}% {emRisco && '⚠ Risco'}
    </Badge>
  );
}
```

---

## 5. Formato Padrão da API

### 5.1 ApiResponse\<T\>

**Toda resposta do backend** usa o wrapper `ApiResponse<T>`:

```typescript
// src/shared/api/types.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}
```

**Exemplos reais de resposta:**

```json
// Sucesso
{ "success": true, "data": { "idTurma": 1, "nome": "5º Ano A" }, "message": null, "error": null }

// Sucesso com mensagem (register, login, logout)
{ "success": true, "data": null, "message": "Usuário registrado com sucesso", "error": null }

// Regra de negócio (422)
{ "success": false, "data": null, "message": null, "error": "Aluno já está matriculado nesta turma" }

// Não encontrado (404)
{ "success": false, "data": null, "message": null, "error": "Turma não encontrada" }
```

### 5.2 Padrão de service (Client Component)

```typescript
// src/features/turma/turmaService.ts
import api from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/api/types';
import type { TurmaDTO } from './types';

export async function buscarTurmas(): Promise<TurmaDTO[]> {
  const res = await api.get<ApiResponse<TurmaDTO[]>>('/v1/turmas');
  return res.data.data ?? [];
}

export async function matricularAluno(idTurma: number, payload: { idAluno: number; obs?: string }): Promise<void> {
  try {
    await api.post(`/v1/turmas/${idTurma}/alunos`, { ...payload, idTurma });
  } catch (error: any) {
    // O backend sempre retorna a mensagem de negócio em "error"
    throw new Error(error.response?.data?.error ?? 'Erro ao matricular aluno');
  }
}
```

---

## 6. Mapeamento Completo de Endpoints

> Base URL: configurado em `NEXT_PUBLIC_API_URL` / `API_URL`
> Prefixo de todas as rotas: `/v1`

### 6.1 Autenticação — `/v1/auth`

| Método | Rota | Body | Resposta | Público |
|--------|------|------|----------|---------|
| POST | `/register` | `{ nome, email, senha, role }` | `ApiResponse<null>` + message | ✅ |
| POST | `/login` | `{ email, senha }` | `ApiResponse<null>` + cookie | ✅ |
| POST | `/logout` | — | `ApiResponse<null>` | ✅ |
| GET | `/me` | — | `ApiResponse<UserMe>` | cookie obrigatório |

### 6.2 Turmas — `/v1/turmas`

| Método | Rota | Body | Resposta | Roles |
|--------|------|------|----------|-------|
| GET | `/v1/turmas` | — | `ApiResponse<TurmaDTO[]>` | ADMINISTRADOR, COORDENADOR |
| GET | `/v1/turmas/{id}` | — | `ApiResponse<TurmaDTO>` | ADMINISTRADOR, COORDENADOR |
| GET | `/v1/turmas/{id}/alunos` | — | `ApiResponse<AlunoTurmaDTO[]>` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| POST | `/v1/turmas` | `TurmaDTO` | `ApiResponse<TurmaDTO>` | ADMINISTRADOR |
| POST | `/v1/turmas/{id}/alunos` | `AlunoTurmaDTO` | `ApiResponse<AlunoTurmaDTO>` | ADMINISTRADOR, COORDENADOR |
| PUT | `/v1/turmas/{id}` | `TurmaDTO` | `ApiResponse<TurmaDTO>` | ADMINISTRADOR |
| DELETE | `/v1/turmas/{id}` | — | `ApiResponse<null>` | ADMINISTRADOR |

```typescript
interface TurmaDTO { idTurma?: number; nome: string; }
interface AlunoTurmaDTO { idAlunoTurma?: number; idAluno: number; idTurma: number; obs?: string; }
```

### 6.3 Pessoas — `/v1/pessoas`

| Método | Rota | Roles |
|--------|------|-------|
| GET | `/v1/pessoas` | ADMINISTRADOR, COORDENADOR, DIRETOR |
| GET | `/v1/pessoas/{id}` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| POST | `/v1/pessoas` | ADMINISTRADOR, COORDENADOR |
| PUT | `/v1/pessoas/{id}` | ADMINISTRADOR, COORDENADOR |
| DELETE | `/v1/pessoas/{id}` | ADMINISTRADOR |

```typescript
interface PessoaDTO {
  idPessoa?: number;
  idTipoPessoa: number;
  nome: string;
  sexo?: string;
  dataNascimento?: string; // "YYYY-MM-DD"
  situacao?: string;
  obs?: string;
}
```

### 6.4 Frequência — `/v1/frequencias`

| Método | Rota | Resposta | Roles |
|--------|------|----------|-------|
| GET | `/v1/frequencias` | `ApiResponse<AlunoFrequenciaDTO[]>` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| GET | `/v1/frequencias/aluno/{idAluno}` | `ApiResponse<AlunoFrequenciaDTO[]>` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| GET | `/v1/frequencias/aluno/{idAluno}/resumo` | `ApiResponse<FrequenciaResumoDTO>` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| POST | `/v1/frequencias/turma/{idTurma}/calendario/{idCalendario}` | `ApiResponse<AlunoFrequenciaDTO[]>` | ADMINISTRADOR, PROFESSOR |
| PUT | `/v1/frequencias/{id}` | `ApiResponse<AlunoFrequenciaDTO>` | ADMINISTRADOR, PROFESSOR |
| DELETE | `/v1/frequencias/{id}` | `ApiResponse<null>` | ADMINISTRADOR |

```typescript
type TipoFrequencia = 'PRESENTE' | 'FALTA' | 'FALTA_JUSTIFICADA';

interface AlunoFrequenciaDTO {
  idAlunoFrequencia?: number;
  idAluno: number;
  idCalendarioEscolar: number;
  tipoFrequencia: TipoFrequencia;
}

interface FrequenciaResumoDTO {
  idAluno: number;
  totalAulas: number;
  totalPresencas: number;
  totalFaltas: number;
  totalFaltasJust: number;
  percentualPresenca: number;   // 0.0 a 100.0
  emRiscoReprovacao: boolean;   // true se percentual < 75%
}
```

**Lançamento em lote (endpoint principal do professor):**
```typescript
// Body: { [idAluno]: TipoFrequencia } — só os alunos que são exceção ao tipoPadrao
// Query param: ?tipoPadrao=PRESENTE (opcional, padrão PRESENTE)
POST /v1/frequencias/turma/1/calendario/3?tipoPadrao=PRESENTE
Body: { "5": "FALTA", "7": "FALTA_JUSTIFICADA" }
```

### 6.5 Avaliações — `/v1/avaliacoes`

| Método | Rota | Body | Roles |
|--------|------|------|-------|
| GET | `/v1/avaliacoes` | — | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| POST | `/v1/avaliacoes` | `AvaliacaoDTO` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| PUT | `/v1/avaliacoes/{id}` | `AvaliacaoDTO` | ADMINISTRADOR, COORDENADOR, PROFESSOR |
| DELETE | `/v1/avaliacoes/{id}` | — | ADMINISTRADOR, COORDENADOR |
| POST | `/v1/avaliacoes/{id}/notas` | `NotaLancamentoDTO[]` | ADMINISTRADOR, PROFESSOR |

```typescript
interface AvaliacaoDTO {
  idAvaliacao?: number;
  idDisciplina: number;
  idCalendarioEscolar: number;
  materia?: string;
  dia?: string;    // "YYYY-MM-DD"
  peso?: number;   // peso para média ponderada (ex: 7 = prova, 3 = trabalho)
}

interface NotaLancamentoDTO {
  idAluno: number;
  nota: number;    // 0.0 a 10.0
  obs?: string;
}
```

### 6.6 Notas e Boletim — `/v1/alunos`

| Método | Rota | Resposta | Roles |
|--------|------|----------|-------|
| GET | `/v1/alunos/{id}/notas` | `ApiResponse<AlunoAvaliacaoDTO[]>` | Todos |
| GET | `/v1/alunos/{id}/boletim` | `ApiResponse<BoletimResponseDTO>` | Todos |

```typescript
type SituacaoAluno = 'APROVADO' | 'EM_RECUPERACAO' | 'REPROVADO_NOTA' | 'REPROVADO_FREQUENCIA';

interface MediaDisciplinaDTO {
  idDisciplina: number;
  nomeDisciplina: string;
  mediaCalculada: number;   // 0.0 a 10.0
  situacao: SituacaoAluno;
}

interface BoletimResponseDTO {
  idAluno: number;
  nomeAluno: string;
  frequencia: FrequenciaResumoDTO;
  disciplinas: MediaDisciplinaDTO[];
}
```

### 6.7 Demais endpoints

| Recurso | Rota base | Roles de leitura | Roles de escrita |
|---------|-----------|-----------------|-----------------|
| Calendários escolares | `/v1/calendarios-escolares` | ADMINISTRADOR, COORDENADOR, PROFESSOR | ADMINISTRADOR, COORDENADOR |
| Anos calendário | `/v1/anos-calendario` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Meses | `/v1/meses` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Períodos | `/v1/periodos` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Instituições | `/v1/instituicoes-ensino` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Cursos | `/v1/cursos` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Classes | `/v1/classes` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Disciplinas | `/v1/disciplinas` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |
| Turnos | `/v1/turnos` | ADMINISTRADOR, COORDENADOR | ADMINISTRADOR |

---

## 7. RBAC — Controle de Acesso por Role

### 7.1 Matriz de acesso por página

| Página | ADMIN | DIRETOR | COORD. | PROF. | ALUNO | RESP. |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard geral | ✅ | ✅ | ✅ | — | — | — |
| Gerenciar usuários / instituição | ✅ | — | — | — | — | — |
| Gerenciar turmas | ✅ | ✅ | ✅ | ver | — | — |
| Matricular aluno | ✅ | — | ✅ | — | — | — |
| Lançar frequência | ✅ | — | — | ✅ | — | — |
| Ver frequência | ✅ | ✅ | ✅ | ✅ | própria | filho |
| Criar avaliação | ✅ | — | ✅ | ✅ | — | — |
| Lançar notas | ✅ | — | — | ✅ | — | — |
| Ver notas / boletim | ✅ | ✅ | ✅ | ✅ | próprio | filho |
| Calendário escolar | ✅ | — | ✅ | ver | — | — |

### 7.2 Hook para checar roles em componentes

```typescript
// src/shared/hooks/useRoles.ts
'use client';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Role } from '@/features/auth/types';

export function useRoles() {
  const user = useAuthStore((s) => s.user);
  return {
    is: (role: Role) => user?.role === role,
    hasAny: (...roles: Role[]) => !!user && roles.includes(user.role),
    role: user?.role,
  };
}

// Uso em componentes:
// const { hasAny } = useRoles();
// {hasAny('ADMINISTRADOR', 'COORDENADOR') && <BotaoMatricular />}
```

### 7.3 Guard de role no layout do App Router

Para proteção no lado do servidor, verificar role no layout do route group:

```typescript
// src/app/(dashboard)/admin/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buscarMeServer } from '@/features/auth/authService';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await buscarMeServer();

  if (user?.role !== 'ADMINISTRADOR') {
    redirect('/acesso-negado');
  }

  return <>{children}</>;
}
```

---

## 8. Tratamento de Erros

### 8.1 Códigos HTTP do backend

| HTTP | Situação | O que mostrar |
|------|----------|---------------|
| 200 | Sucesso | Exibir `data`; toast de `message` se não null |
| 201 | Criado | Toast de sucesso com `message` |
| 400 | Validação (`@Valid` falhou) | Exibir `error` nos campos do formulário |
| 401 | Não autenticado | Redirecionar para `/login` |
| 403 | Sem permissão | Toast "Sem permissão para esta ação" |
| 404 | Não encontrado | Toast com `error` do backend |
| 422 | Regra de negócio | Toast com `error` do backend (ex: "Aluno já matriculado") |
| 500 | Erro interno | Toast "Erro interno. Tente novamente." |

### 8.2 Uso com TanStack Query + toast do shadcn

```typescript
// src/features/turma/turmaQueries.ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { matricularAluno } from './turmaService';

export function useMatricularAluno(idTurma: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: { idAluno: number; obs?: string }) =>
      matricularAluno(idTurma, payload),
    onSuccess: () => {
      toast({ title: 'Aluno matriculado com sucesso' });
      // Invalida a lista de alunos da turma para recarregar
      queryClient.invalidateQueries({ queryKey: ['turma', idTurma, 'alunos'] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    },
  });
}
```

---

## 9. Regras de Negócio — O Que o Frontend Deve Conhecer

### 9.1 Frequência (LDB Art. 24)

- Frequência mínima legal: **75%**
- Exibir `FrequenciaBadge` com alerta vermelho quando `emRiscoReprovacao === true`
- `FALTA_JUSTIFICADA` — exibir em amarelo; não conta para reprovação, mas aparece no total
- Fluxo principal do professor:
  1. Seleciona turma → lista alunos via `GET /v1/turmas/{id}/alunos`
  2. Seleciona aula (entrada do calendário) → `GET /v1/calendarios-escolares`
  3. Toggle por aluno: ✅ PRESENTE / ❌ FALTA / ⚠️ FALTA_JUSTIFICADA
  4. Salva via `POST /v1/frequencias/turma/{id}/calendario/{id}`

### 9.2 Situação do aluno

| Valor | Condição | Cor (Tailwind) |
|-------|----------|---------------|
| `APROVADO` | média ≥ 5.0 e freq ≥ 75% | `green` |
| `EM_RECUPERACAO` | média 3.0–4.9 | `yellow` / `orange` |
| `REPROVADO_NOTA` | média < 3.0 | `red` |
| `REPROVADO_FREQUENCIA` | freq < 75% (prevalece sobre a nota) | `red` |

### 9.3 Lançamento de notas em lote

1. Professor seleciona ou cria avaliação (`POST /v1/avaliacoes`) — definindo o `peso`
2. Sistema carrega alunos da turma
3. Professor informa nota (0.0–10.0) para cada aluno
4. Ao salvar: `POST /v1/avaliacoes/{id}/notas` com array de `NotaLancamentoDTO`

---

## 10. Variáveis de Ambiente

```env
# .env.local — NÃO versionar (adicionar ao .gitignore)
NEXT_PUBLIC_API_URL=http://localhost:8080/api   # usada no browser
API_URL=http://localhost:8080/api               # usada no servidor (SSR)

# Produção — configurar no painel da Vercel
NEXT_PUBLIC_API_URL=https://api.diariodigital.com.br/api
API_URL=https://api.diariodigital.com.br/api
```

> **Diferença importante:**
> - `NEXT_PUBLIC_*` → exposta ao browser (Client Components, Axios)
> - Sem prefixo → apenas no servidor (Server Components, fetch SSR)

---

## 11. Deploy

### 11.1 Frontend — Vercel

```bash
# Configuração mínima no painel da Vercel:
# Framework Preset: Next.js
# Root Directory: / (raiz do projeto frontend)
# Environment Variables: NEXT_PUBLIC_API_URL, API_URL
```

- Conectar o repositório GitHub à Vercel
- Cada PR cria um **Preview Deployment** automático
- Merge na `main` faz deploy em produção automaticamente

### 11.2 Backend — Railway ou Render

```bash
# Railway:
# Novo projeto → "Deploy from GitHub Repo"
# Adicionar variáveis de ambiente: DB_URL, DB_USER, DB_PASS, JWT_SECRET
# Railway detecta automaticamente o Dockerfile ou Maven

# Render:
# New Web Service → conectar repositório
# Build Command: ./mvnw package -DskipTests
# Start Command: java -jar target/*.jar
```

**CORS:** O backend precisa permitir a origem do frontend. Configurar `CorsConfig.java` com a URL da Vercel:

```java
// No backend, CorsConfig.java — adicionar a URL de produção
configuration.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "https://diario-digital.vercel.app"  // URL do deploy na Vercel
));
configuration.setAllowCredentials(true); // ← OBRIGATÓRIO para cookies
```

---

## 12. Padrões de Código Obrigatórios

### 12.1 Formulário com shadcn Form + React Hook Form + Zod

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export function PessoaForm({ onSubmit }: { onSubmit: (data: FormData) => Promise<void> }) {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={form.formState.isSubmitting}>Salvar</Button>
      </form>
    </Form>
  );
}
```

### 12.2 Página com Server Component + Client Component separados

```typescript
// src/app/(dashboard)/turmas/page.tsx — Server Component (busca dados)
import { buscarTurmasServer } from '@/features/turma/turmaService';
import { TurmaTable } from './TurmaTable';

export default async function TurmasPage() {
  const turmas = await buscarTurmasServer();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Turmas</h1>
      <TurmaTable turmas={turmas} />  {/* Client Component com interatividade */}
    </div>
  );
}
```

```typescript
// src/app/(dashboard)/turmas/TurmaTable.tsx — Client Component (interatividade)
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { TurmaDTO } from '@/features/turma/types';

export function TurmaTable({ turmas }: { turmas: TurmaDTO[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {turmas.map((t) => (
          <TableRow key={t.idTurma}>
            <TableCell>{t.idTurma}</TableCell>
            <TableCell>{t.nome}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">Ver alunos</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 13. Páginas Prioritárias (Ordem de Implementação)

| # | Página | Rota Next.js | Endpoint principal |
|---|--------|-------------|-------------------|
| 1 | Login | `/login` | `POST /v1/auth/login` |
| 2 | Dashboard por role | `/` → redirect | `GET /v1/auth/me` |
| 3 | Listagem de turmas | `/turmas` | `GET /v1/turmas` |
| 4 | Listagem de alunos | `/alunos` | `GET /v1/pessoas` |
| 5 | Matricular aluno | `/turmas/[id]` | `POST /v1/turmas/{id}/alunos` |
| 6 | Lançar frequência | `/turmas/[id]/frequencia` | `POST /v1/frequencias/turma/{id}/calendario/{id}` |
| 7 | Resumo de frequência | `/alunos/[id]` | `GET /v1/frequencias/aluno/{id}/resumo` |
| 8 | Criar avaliação + notas | `/avaliacoes/[id]/notas` | `POST /v1/avaliacoes/{id}/notas` |
| 9 | Boletim do aluno | `/alunos/[id]/boletim` | `GET /v1/alunos/{id}/boletim` |
| 10 | Calendário escolar | `/calendario` | `GET/POST /v1/calendarios-escolares` |

---

## 14. O Que Nunca Fazer

- ❌ Nunca armazenar o token JWT em `localStorage` ou `sessionStorage` — ele vive no cookie HttpOnly do backend
- ❌ Nunca fazer `withCredentials: false` no Axios — o cookie não será enviado e toda chamada autenticada vai falhar
- ❌ Nunca usar `NEXT_PUBLIC_` em variáveis sensíveis (ex: chave privada, senha de banco) — são expostas ao browser
- ❌ Nunca criar componentes UI do zero (botão, input, tabela, modal) quando o shadcn/ui já oferece
- ❌ Nunca ignorar o campo `error` da `ApiResponse` — ele contém a mensagem de negócio do backend
- ❌ Nunca chamar a API diretamente dentro de um componente — sempre via service + query
- ❌ Nunca marcar como `'use client'` sem necessidade — preferir Server Components para dados estáticos
- ❌ Nunca commitar `.env.local` — adicionar ao `.gitignore`
- ❌ Nunca commitar diretamente na `main` — todo código passa por PR

---

## 15. Git Flow (mesmo padrão do backend)

```
main      → código estável, produção (deploy automático na Vercel)
develop   → integração contínua
feature/* → ex: feature/tela-lancamento-frequencia
fix/*     → ex: fix/badge-situacao-aluno
chore/*   → ex: chore/configurar-shadcn
```

**Todo PR gera Preview Deployment na Vercel automaticamente** — testar antes de aprovar o merge.

---

*Última atualização: 2026 — Versão 1.1 (Next.js 14 + shadcn/ui + Vercel)*
