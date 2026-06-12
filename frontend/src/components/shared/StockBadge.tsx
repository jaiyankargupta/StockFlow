import { Badge } from '@/components/ui/Badge';
import { getStockStatus } from '@/lib/utils';

export function StockBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity);
  if (quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
  const config = {
    critical: { variant: 'danger' as const, label: `Critical (${quantity})` },
    low: { variant: 'warning' as const, label: `Low (${quantity})` },
    normal: { variant: 'neutral' as const, label: `${quantity} units` },
    high: { variant: 'success' as const, label: `${quantity} units` },
  };
  const cfg = config[status];
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}
