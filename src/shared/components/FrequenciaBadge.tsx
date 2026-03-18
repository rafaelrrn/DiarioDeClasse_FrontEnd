import { Badge } from '@/components/ui/badge';

export function FrequenciaBadge({
  percentual,
  emRisco,
}: {
  percentual: number;
  emRisco: boolean;
}) {
  return (
    <Badge variant={emRisco ? 'destructive' : 'default'}>
      {percentual.toFixed(1)}%{emRisco && ' ⚠ Risco'}
    </Badge>
  );
}
