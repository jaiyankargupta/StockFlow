import { apiClient } from "./client";
import type {
  Order,
  OrderCreate,
  PaginatedResponse,
  OrderStatus,
} from "../types";

export interface OrderFilters {
  skip?: number;
  limit?: number;
  status?: OrderStatus | "";
  customer_id?: number;
}

export const ordersApi = {
  list: async (
    filters: OrderFilters = {},
  ): Promise<PaginatedResponse<Order>> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined),
    );
    const { data } = await apiClient.get("/orders", { params });
    return data;
  },
  get: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },
  create: async (payload: OrderCreate): Promise<Order> => {
    const { data } = await apiClient.post("/orders", payload);
    return data;
  },
  exportCsv: async (): Promise<string> => {
    const { data } = await apiClient.get("/orders/export/csv");
    return data;
  },
};
