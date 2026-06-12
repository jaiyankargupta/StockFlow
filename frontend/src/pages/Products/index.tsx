import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { productsApi } from "@/api/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/shared/SearchBar";
import { StockBadge } from "@/components/shared/StockBadge";
import { ExportButton } from "@/components/shared/ExportButton";
import { useToast } from "@/components/ui/Toast";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import type { Product } from "@/types";

const productSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(50, "SKU too long"),
  name: z.string().trim().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock_quantity: z.coerce
    .number()
    .int("Must be whole number")
    .min(0, "Stock cannot be negative"),
});

type ProductFormData = z.infer<typeof productSchema>;

const LIMIT = 20;

export default function ProductsPage() {
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({
    skip: (page - 1) * LIMIT,
    limit: LIMIT,
    search: search || undefined,
  });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
  });

  const openCreate = () => {
    setEditing(null);
    reset({ sku: "", name: "", description: "", price: 0, stock_quantity: 0 });
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    reset({
      sku: p.sku,
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      stock_quantity: p.stock_quantity,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: ProductFormData) => {
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: formData });
        success("Product updated");
      } else {
        await createProduct.mutateAsync(formData);
        success("Product created");
      }
      setModalOpen(false);
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      success("Product deleted");
      setDeleteTarget(null);
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Products
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {data?.total ?? 0} total products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            onExport={productsApi.exportCsv}
            filename="products.csv"
          />
          <Button icon={<Plus className="w-3.5 h-3.5" />} onClick={openCreate}>
            New Product
          </Button>
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by name or SKU…"
        className="max-w-sm"
      />

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="No products found"
          description={
            search
              ? "Try a different search term."
              : "Create your first product to get started."
          }
          action={
            !search ? (
              <Button
                onClick={openCreate}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                New Product
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
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden sm:table-cell">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden lg:table-cell">
                  Added
                </th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.data.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {p.sku}
                  </td>
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
                  <td className="px-4 py-3 tabular-nums hidden md:table-cell text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StockBadge quantity={p.stock_quantity} />
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 hidden lg:table-cell">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
        title={editing ? "Edit Product" : "New Product"}
        description={
          editing
            ? "Update product details."
            : "Add a new product to inventory."
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU *"
              {...register("sku")}
              error={errors.sku?.message}
              placeholder="e.g. PROD-001"
            />
            <Input
              label="Name *"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Product name"
            />
          </div>
          <Textarea
            label="Description"
            {...register("description")}
            placeholder="Optional description"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price *"
              type="number"
              step="0.01"
              min="0.01"
              {...register("price")}
              error={errors.price?.message}
              placeholder="0.00"
            />
            <Input
              label="Stock Quantity *"
              type="number"
              min="0"
              step="1"
              {...register("stock_quantity")}
              error={errors.stock_quantity?.message}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleteProduct.isPending}
      />
    </div>
  );
}
