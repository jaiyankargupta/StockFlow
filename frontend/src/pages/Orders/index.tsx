import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, ShoppingCart, X } from "lucide-react";
import { useOrders, useCreateOrder } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExportButton } from "@/components/shared/ExportButton";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime, getErrorMessage } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { OrderStatus } from "@/types";

const orderSchema = z.object({
  customer_id: z.coerce.number().positive("Select a customer"),
  items: z
    .array(
      z.object({
        product_id: z.coerce.number().positive("Select a product"),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Add at least one item"),
});

type OrderFormData = z.infer<typeof orderSchema>;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const LIMIT = 20;

export default function OrdersPage() {
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useOrders({
    skip: (page - 1) * LIMIT,
    limit: LIMIT,
    status: statusFilter || undefined,
  });
  const { data: customersData } = useCustomers({ limit: 200 });

  const getCustomerName = (id: number) => {
    const customer = customersData?.data.find((c) => c.id === id);
    return customer ? customer.name : `#${id}`;
  };
  const { data: productsData } = useProducts({ limit: 200 });
  const createOrder = useCreateOrder();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orderSchema) as any,
    defaultValues: { customer_id: 0, items: [{ product_id: 0, quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const customerOptions = (customersData?.data ?? []).map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.email})`,
  }));
  const productOptions = (productsData?.data ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name} — ${formatCurrency(p.price)} (${p.stock_quantity} in stock)`,
  }));

  const estimatedTotal = watchedItems.reduce((sum, item) => {
    const product = productsData?.data.find(
      (p) => p.id === Number(item.product_id),
    );
    return sum + (product?.price ?? 0) * (item.quantity || 0);
  }, 0);

  const onSubmit = async (formData: OrderFormData) => {
    try {
      await createOrder.mutateAsync(formData);
      success("Order created successfully");
      setModalOpen(false);
      reset();
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Orders
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {data?.total ?? 0} total orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={ordersApi.exportCsv} filename="orders.csv" />
          <Button
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              reset();
              setModalOpen(true);
            }}
          >
            New Order
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<ShoppingCart className="w-6 h-6" />}
          title="No orders found"
          description={
            statusFilter
              ? "No orders with this status."
              : "Create your first order."
          }
          action={
            !statusFilter ? (
              <Button
                onClick={() => setModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                New Order
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Items
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden lg:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.data.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-300 font-semibold">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">
                    {getCustomerName(o.customer_id)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-300">
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatCurrency(o.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-300 hidden lg:table-cell">
                    {formatDateTime(o.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
            <Pagination
              page={page}
              total={data.total}
              limit={LIMIT}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Order"
        description="Select a customer and add products."
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Select
            label="Customer *"
            options={customerOptions}
            placeholder="Select a customer…"
            {...register("customer_id")}
            error={errors.customer_id?.message}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Order Items
              </p>
              <button
                type="button"
                onClick={() => append({ product_id: 0, quantity: 1 })}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            {errors.items?.message && (
              <p className="text-xs text-red-500">{errors.items.message}</p>
            )}
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Select
                    options={productOptions}
                    placeholder="Select product…"
                    {...register(`items.${i}.product_id`)}
                    error={errors.items?.[i]?.product_id?.message}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    {...register(`items.${i}.quantity`)}
                    error={errors.items?.[i]?.quantity?.message}
                  />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="mt-0.5 p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {estimatedTotal > 0 && (
            <div className="flex justify-between items-center py-3 px-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Estimated Total
              </p>
              <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {formatCurrency(estimatedTotal)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Place Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
