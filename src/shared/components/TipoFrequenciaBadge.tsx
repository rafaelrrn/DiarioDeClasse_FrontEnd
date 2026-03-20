import { Badge } from '@/components/ui/badge';
import type { TipoFrequencia } from '@/features/frequencia/types';

const labelMap: Record<TipoFrequencia, string> = {
  PRESENTE: 'Presente',
  FALTA: 'Falta',
  FALTA_JUSTIFICADA: 'Falta Justificada',
};

const variantMap: Record<TipoFrequencia, 'default' | 'destructive' | 'secondary'> = {
  PRESENTE: 'default',
  FALTA: 'destructive',
  FALTA_JUSTIFICADA: 'secondary',
};

export function TipoFrequenciaBadge({ tipo }: { tipo: TipoFrequencia }) {
  return <Badge variant={variantMap[tipo]}>{labelMap[tipo]}</Badge>;
}
