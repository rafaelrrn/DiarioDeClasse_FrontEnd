'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/shared/components/PageHeader';
import { InstituicaoTabContent } from './InstituicaoTabContent';
import { NomeTabContent } from './NomeTabContent';
import { CursoTabContent } from './CursoTabContent';
import {
  useEnsinos,
  useCriarEnsino,
  useAtualizarEnsino,
  useDeletarEnsino,
  useGraus,
  useCriarGrau,
  useAtualizarGrau,
  useDeletarGrau,
  useSeries,
  useCriarSerie,
  useAtualizarSerie,
  useDeletarSerie,
  useTurnos,
  useCriarTurno,
  useAtualizarTurno,
  useDeletarTurno,
} from '@/features/instituicao/instituicaoQueries';

// ─── Wrappers para os recursos com campos "nome" ──────────────────────────────

function EnsinoTab() {
  const query = useEnsinos();
  const criar = useCriarEnsino();
  const atualizar = useAtualizarEnsino();
  const deletar = useDeletarEnsino();

  const items = (query.data ?? []).map((e) => ({ id: e.idEnsino!, nome: e.nome }));

  return (
    <NomeTabContent
      label="Ensino"
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      isMutating={criar.isPending || atualizar.isPending || deletar.isPending}
      onRefetch={() => query.refetch()}
      onCriar={(nome, onSuccess) => criar.mutate({ nome }, { onSuccess })}
      onAtualizar={(id, nome, onSuccess) =>
        atualizar.mutate({ id, dto: { nome } }, { onSuccess })
      }
      onDeletar={(id, onSuccess) => deletar.mutate(id, { onSuccess })}
    />
  );
}

function GrauTab() {
  const query = useGraus();
  const criar = useCriarGrau();
  const atualizar = useAtualizarGrau();
  const deletar = useDeletarGrau();

  const items = (query.data ?? []).map((g) => ({ id: g.idGrau!, nome: g.nome }));

  return (
    <NomeTabContent
      label="Grau"
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      isMutating={criar.isPending || atualizar.isPending || deletar.isPending}
      onRefetch={() => query.refetch()}
      onCriar={(nome, onSuccess) => criar.mutate({ nome }, { onSuccess })}
      onAtualizar={(id, nome, onSuccess) =>
        atualizar.mutate({ id, dto: { nome } }, { onSuccess })
      }
      onDeletar={(id, onSuccess) => deletar.mutate(id, { onSuccess })}
    />
  );
}

function SerieTab() {
  const query = useSeries();
  const criar = useCriarSerie();
  const atualizar = useAtualizarSerie();
  const deletar = useDeletarSerie();

  const items = (query.data ?? []).map((s) => ({ id: s.idSerie!, nome: s.nome }));

  return (
    <NomeTabContent
      label="Série"
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      isMutating={criar.isPending || atualizar.isPending || deletar.isPending}
      onRefetch={() => query.refetch()}
      onCriar={(nome, onSuccess) => criar.mutate({ nome }, { onSuccess })}
      onAtualizar={(id, nome, onSuccess) =>
        atualizar.mutate({ id, dto: { nome } }, { onSuccess })
      }
      onDeletar={(id, onSuccess) => deletar.mutate(id, { onSuccess })}
    />
  );
}

function TurnoTab() {
  const query = useTurnos();
  const criar = useCriarTurno();
  const atualizar = useAtualizarTurno();
  const deletar = useDeletarTurno();

  const items = (query.data ?? []).map((t) => ({ id: t.idTurno!, nome: t.nome }));

  return (
    <NomeTabContent
      label="Turno"
      items={items}
      isLoading={query.isLoading}
      isError={query.isError}
      isMutating={criar.isPending || atualizar.isPending || deletar.isPending}
      onRefetch={() => query.refetch()}
      onCriar={(nome, onSuccess) => criar.mutate({ nome }, { onSuccess })}
      onAtualizar={(id, nome, onSuccess) =>
        atualizar.mutate({ id, dto: { nome } }, { onSuccess })
      }
      onDeletar={(id, onSuccess) => deletar.mutate(id, { onSuccess })}
    />
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminInstituicaoPage() {
  return (
    <div>
      <PageHeader title="Configurações da Instituição" />
      <Tabs defaultValue="instituicao">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="instituicao">Instituição</TabsTrigger>
          <TabsTrigger value="ensino">Ensino</TabsTrigger>
          <TabsTrigger value="grau">Grau</TabsTrigger>
          <TabsTrigger value="serie">Série</TabsTrigger>
          <TabsTrigger value="turno">Turno</TabsTrigger>
          <TabsTrigger value="curso">Curso</TabsTrigger>
        </TabsList>

        <TabsContent value="instituicao">
          <InstituicaoTabContent />
        </TabsContent>
        <TabsContent value="ensino">
          <EnsinoTab />
        </TabsContent>
        <TabsContent value="grau">
          <GrauTab />
        </TabsContent>
        <TabsContent value="serie">
          <SerieTab />
        </TabsContent>
        <TabsContent value="turno">
          <TurnoTab />
        </TabsContent>
        <TabsContent value="curso">
          <CursoTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
