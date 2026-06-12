import { apiClient } from "./client";
import type {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  PaginatedResponse,
} from "../types";

export interface CustomerFilters {
  skip?: number;
  limit?: number;
  search?: string;
}

export const customersApi = {
  list: async (
    filters: CustomerFilters = {},
  ): Promise<PaginatedResponse<Customer>> => {
    const { data } = await apiClient.get("/customers", { params: filters });
    return data;
  },
  get: async (id: number): Promise<Customer> => {
    const { data } = await apiClient.get(`/customers/${id}`);
    return data;
  },
  create: async (payload: CustomerCreate): Promise<Customer> => {
    const { data } = await apiClient.post("/customers", payload);
    return data;
  },
  update: async (id: number, payload: CustomerUpdate): Promise<Customer> => {
    const { data } = await apiClient.put(`/customers/${id}`, payload);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
  exportCsv: async (): Promise<string> => {
    const { data } = await apiClient.get("/customers/export/csv");
    return data;
  },
};
