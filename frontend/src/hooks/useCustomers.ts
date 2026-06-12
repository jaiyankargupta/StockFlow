import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi, type CustomerFilters } from "../api/customers";
import type { CustomerCreate, CustomerUpdate } from "../types";

export const CUSTOMERS_KEY = "customers";

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, filters],
    queryFn: () => customersApi.list(filters),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerCreate) => customersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerUpdate }) =>
      customersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
}
