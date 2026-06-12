import { apiClient } from "./client";
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  PaginatedResponse,
} from "../types";

export interface ProductFilters {
  skip?: number;
  limit?: number;
  search?: string;
}

export const productsApi = {
  list: async (
    filters: ProductFilters = {},
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get("/products", { params: filters });
    return data;
  },
  get: async (id: number): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },
  create: async (payload: ProductCreate): Promise<Product> => {
    const { data } = await apiClient.post("/products", payload);
    return data;
  },
  update: async (id: number, payload: ProductUpdate): Promise<Product> => {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
  getLowStock: async (threshold = 10): Promise<Product[]> => {
    const { data } = await apiClient.get("/products/low-stock", {
      params: { threshold },
    });
    return data;
  },
  exportCsv: async (): Promise<string> => {
    const { data } = await apiClient.get("/products/export/csv");
    return data;
  },
};
