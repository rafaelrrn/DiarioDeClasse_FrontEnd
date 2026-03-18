import { buscarCalendariosServer } from '@/features/calendario/calendarioService';
import { PageHeader } from '@/shared/components/PageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function CalendarioPage() {
  const calendarios = await buscarCalendariosServer();

  return (
    <div>
      <PageHeader title="Calendário Escolar" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calendarios.map((c) => (
            <TableRow key={c.idCalendarioEscolar}>
              <TableCell>{c.idCalendarioEscolar}</TableCell>
              <TableCell>{c.data}</TableCell>
              <TableCell>{c.descricao ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
