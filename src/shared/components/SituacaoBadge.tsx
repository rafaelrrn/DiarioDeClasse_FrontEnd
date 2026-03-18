import { Badge } from '@/components/ui/badge';
import type { SituacaoAluno } from '@/features/avaliacao/types';

const config: Record<
  SituacaoAluno,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  APROVADO: { label: 'Aprovado', variant: 'default' },
  EM_RECUPERACAO: { label: 'Em Recuperação', variant: 'secondary' },
  REPROVADO_NOTA: { label: 'Reprovado (Nota)', variant: 'destructive' },
  REPROVADO_FREQUENCIA: { label: 'Reprovado (Freq.)', variant: 'destructive' },
};

export function SituacaoBadge({ situacao }: { situacao: SituacaoAluno }) {
  const { label, variant } = config[situacao];
  return <Badge variant={variant}>{label}</Badge>;
}
