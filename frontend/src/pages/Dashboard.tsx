import { useDashboard } from "@/hooks/useDashboard";
import { PageSpinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { currency, formatCurrency } = useCurrency();

  const formatTick = (v: number) => {
    if (currency === "INR") {
      return `₹${((v * 83) / 1000).toFixed(0)}k`;
    }
    return `$${(v / 1000).toFixed(0)}k`;
  };

  if (isLoading) return <PageSpinner />;
  if (error || !data)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-neutral-500">
          Failed to load dashboard metrics.
        </p>
      </div>
    );

  const pieData = Object.entries(data.orders_by_status).map(
    ([name, value]) => ({ name, value }),
  );
  const revenueData = [
    { name: "Last 30d", revenue: data.revenue_last_30_days },
    { name: "All time", revenue: data.total_revenue },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Overview of your inventory and orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={data.total_products.toString()}
          icon={Package}
        />
        <StatCard
          label="Total Customers"
          value={data.total_customers.toString()}
          icon={Users}
        />
        <StatCard
          label="Total Orders"
          value={data.total_orders.toString()}
          icon={ShoppingCart}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(data.total_revenue)}
          icon={TrendingUp}
          sub={`${formatCurrency(data.revenue_last_30_days)} last 30 days`}
        />
      </div>

      {/* Alert bar */}
      {data.low_stock_count > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">
              {data.low_stock_count} product
              {data.low_stock_count !== 1 ? "s" : ""}
            </span>{" "}
            running low on stock.{" "}
            <a
              href="/inventory"
              className="underline underline-offset-2 hover:no-underline"
            >
              View inventory →
            </a>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Revenue Overview
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} barSize={40}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatTick}
              />
              <Tooltip
                formatter={(v: unknown) => formatCurrency(Number(v))}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Orders by Status
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-sm text-neutral-400">
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Recent Orders
          </h2>
        </div>
        {data.recent_orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">
            No orders yet
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {data.recent_orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-300 font-semibold">
                    #{order.id}
                  </span>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Customer #{order.customer_id}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <span className="text-xs text-neutral-400 hidden sm:block">
                    {formatRelativeTime(order.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
