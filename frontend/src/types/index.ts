export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
}

export type ProductUpdate = Partial<ProductCreate>;

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export type CustomerUpdate = Partial<CustomerCreate>;

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_id: number;
  items: OrderItemCreate[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardMetrics {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  low_stock_count: number;
  recent_orders: Array<{
    id: number;
    customer_id: number;
    total_amount: number;
    status: OrderStatus;
    created_at: string;
  }>;
  orders_by_status: Record<string, number>;
  revenue_last_30_days: number;
}
