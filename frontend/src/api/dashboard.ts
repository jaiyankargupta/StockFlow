import { apiClient } from "./client";
import type { DashboardMetrics } from "../types";

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get("/dashboard/metrics");
    return data;
  },
};
