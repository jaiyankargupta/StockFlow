import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { customersApi } from '@/api/customers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SearchBar } from '@/components/shared/SearchBar';
import { ExportButton } from '@/components/shared/ExportButton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { Customer } from '@/types';

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const LIMIT = 20;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({ skip: (page - 1) * LIMIT, limit: LIMIT, search: search || undefined });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); reset({ name: c.name, email: c.email, phone: c.phone ?? '', address: c.address ?? '' }); setModalOpen(true); };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editing) {
        await updateCustomer.mutateAsync({ id: editing.id, data });
        success('Customer updated');
      } else {
        await createCustomer.mutateAsync(data);
        success('Customer created');
      }
      setModalOpen(false);
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      success('Customer deleted');
      setDeleteTarget(null);
    } catch (err) {
      error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Customers</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{data?.total ?? 0} total customers</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton onExport={customersApi.exportCsv} filename="customers.csv" />
          <Button icon={<Plus className="w-3.5 h-3.5" />} onClick={openCreate}>New Customer</Button>
        </div>
      </div>

      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by name or email…" className="max-w-sm" />

      {isLoading ? <PageSpinner /> : !data?.data.length ? (
        <EmptyState icon={<Users className="w-6 h-6" />} title="No customers found" description={search ? 'Try a different search term.' : 'Add your first customer to get started.'} action={!search ? <Button onClick={openCreate} icon={<Plus className="w-3.5 h-3.5" />}>New Customer</Button> : undefined} />
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.data.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{c.name}</p>
                    {c.address && <p className="text-xs text-neutral-400 truncate max-w-[180px]">{c.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">{c.email}</td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-300 hidden md:table-cell">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-300 hidden lg:table-cell">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
            <Pagination page={page} total={data.total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'New Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" {...register('name')} error={errors.name?.message} placeholder="Full name" />
            <Input label="Email *" type="email" {...register('email')} error={errors.email?.message} placeholder="email@example.com" />
          </div>
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} placeholder="+1 (555) 000-0000" />
          <Textarea label="Address" {...register('address')} placeholder="Street, City, State, ZIP" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editing ? 'Save Changes' : 'Create Customer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={onDelete}
        title="Delete Customer" description={`Delete "${deleteTarget?.name}"? Their orders will also be removed.`}
        loading={deleteCustomer.isPending}
      />
    </div>
  );
}
