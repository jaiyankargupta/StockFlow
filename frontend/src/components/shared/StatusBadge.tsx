import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { variant: 'success' | 'warning' | 'info' | 'neutral' | 'danger'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  confirmed: { variant: 'info', label: 'Confirmed' },
  shipped: { variant: 'info', label: 'Shipped' },
  delivered: { variant: 'success', label: 'Delivered' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { variant: 'neutral' as const, label: status };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}
