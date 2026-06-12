import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type OrderFilters } from "../api/orders";
import type { OrderCreate } from "../types";

export const ORDERS_KEY = "orders";

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: [ORDERS_KEY, filters],
    queryFn: () => ordersApi.list(filters),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) => ordersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ORDERS_KEY] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
