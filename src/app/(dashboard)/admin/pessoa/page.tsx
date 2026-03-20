'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/shared/components/PageHeader';
import { TipoPessoaTabContent } from './TipoPessoaTabContent';
import { ContatosTabContent } from './ContatosTabContent';
import { EnderecosTabContent } from './EnderecosTabContent';

export default function AdminPessoaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações de Pessoa" />
      <Tabs defaultValue="tipos">
        <TabsList>
          <TabsTrigger value="tipos">Tipos de Pessoa</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="enderecos">Endereços</TabsTrigger>
        </TabsList>
        <TabsContent value="tipos" className="mt-4">
          <TipoPessoaTabContent />
        </TabsContent>
        <TabsContent value="contatos" className="mt-4">
          <ContatosTabContent />
        </TabsContent>
        <TabsContent value="enderecos" className="mt-4">
          <EnderecosTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
