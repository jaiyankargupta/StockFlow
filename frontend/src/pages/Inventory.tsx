import { useLowStockProducts } from "@/hooks/useProducts";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { StockBadge } from "@/components/shared/StockBadge";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function InventoryPage() {
  const { data: lowStock, isLoading } = useLowStockProducts(10);

  const critical =
    lowStock?.filter((p) => getStockStatus(p.stock_quantity) === "critical") ??
    [];
  const low =
    lowStock?.filter((p) => getStockStatus(p.stock_quantity) === "low") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Inventory Health
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Products requiring your attention
        </p>
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Critical / Out of Stock
            </p>
          </div>
          <p className="text-2xl font-bold text-red-600 tabular-nums">
            {isLoading ? "—" : critical.length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Low Stock (≤10)
            </p>
          </div>
          <p className="text-2xl font-bold text-amber-600 tabular-nums">
            {isLoading ? "—" : low.length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Total Alerts
            </p>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {isLoading ? "—" : (lowStock?.length ?? 0)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !lowStock?.length ? (
        <EmptyState
          icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
          title="All products are well-stocked"
          description="No products are running low on inventory right now."
        />
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Low Stock Products
            </h2>
            <Badge variant="warning">
              {lowStock.length} alert{lowStock.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden sm:table-cell">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Stock Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden md:table-cell">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {[...critical, ...low].map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {p.name}
                    </p>
                    {p.description && (
                      <p className="text-xs text-neutral-400 truncate max-w-[200px]">
                        {p.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 hidden sm:table-cell">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge quantity={p.stock_quantity} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell tabular-nums">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 hidden lg:table-cell">
                    {formatDate(p.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
