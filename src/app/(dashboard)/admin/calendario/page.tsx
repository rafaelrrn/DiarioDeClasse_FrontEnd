'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/shared/components/PageHeader';
import { AnoCalendarioTabContent } from './AnoCalendarioTabContent';
import { MesesTabContent } from './MesesTabContent';
import { PeriodosTabContent } from './PeriodosTabContent';

export default function AdminCalendarioPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações de Calendário" />
      <Tabs defaultValue="anos">
        <TabsList>
          <TabsTrigger value="anos">Anos Calendário</TabsTrigger>
          <TabsTrigger value="meses">Meses</TabsTrigger>
          <TabsTrigger value="periodos">Períodos</TabsTrigger>
        </TabsList>
        <TabsContent value="anos" className="mt-4">
          <AnoCalendarioTabContent />
        </TabsContent>
        <TabsContent value="meses" className="mt-4">
          <MesesTabContent />
        </TabsContent>
        <TabsContent value="periodos" className="mt-4">
          <PeriodosTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
