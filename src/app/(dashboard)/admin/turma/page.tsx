'use client';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { PageHeader } from '@/shared/components/PageHeader';
import { DisciplinaTabContent } from './DisciplinaTabContent';
import { ComponenteCurricularTabContent } from './ComponenteCurricularTabContent';
import { ClasseTabContent } from './ClasseTabContent';

export default function AdminTurmaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações de Turma" />
      <Tabs defaultValue="disciplinas">
        <TabsList>
          <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
          <TabsTrigger value="componentes">Componentes Curriculares</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>
        <TabsContent value="disciplinas" className="mt-4">
          <DisciplinaTabContent />
        </TabsContent>
        <TabsContent value="componentes" className="mt-4">
          <ComponenteCurricularTabContent />
        </TabsContent>
        <TabsContent value="classes" className="mt-4">
          <ClasseTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
