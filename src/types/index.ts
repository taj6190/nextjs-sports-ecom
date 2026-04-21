// ============================================================
// Shared TypeScript Types for ElectroMart
// ============================================================

export interface IImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface IAttributeValue {
  attributeId: string;
  name: string;
  values: string[];
}

export interface IVariant {
  _id?: string;
  sku: string;
  combination: Record<string, string>;
  price: number;
  discountPrice?: number;
  stock: number;
  images: IImage[];
  isActive: boolean;
  weight?: number;
}

export interface ISpecificationItem {
  key: string;
  value: string;
}

export interface ISpecificationGroup {
  group: string;
  items: ISpecificationItem[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string | ICategory;
  images: IImage[];
  attributes: IAttributeValue[];
  variants: IVariant[];
  specifications: ISpecificationGroup[];
  basePrice: number;
  maxPrice: number;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seo: {
    title: string;
    description: string;
  };
  purchaseCount: number;
  avgRating: number;
  reviewCount: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: IImage;
  icon?: string;
  parent?: string | ICategory | null;
  children?: ICategory[];
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: IImage;
  description?: string;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAttribute {
  _id: string;
  name: string;
  values: string[];
  type: "select" | "color" | "button";
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  product: string | IProduct;
  productName: string;
  productSlug: string;
  productImage: string;
  variant: {
    sku: string;
    combination: Record<string, string>;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface ITrackingEvent {
  status: string;
  message: string;
  timestamp: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string | IUser;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: "cod" | "bkash" | "nagad";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingHistory: ITrackingEvent[];
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  refunds?: {
    amount: number;
    reason: string;
    status: string;
    timestamp: string;
    processedBy?: string;
  }[];
  isRefunded?: boolean;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  wishlist: string[];
  addresses: IShippingAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  user: string | { _id: string; name: string };
  product: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITodaysDeal {
  _id: string;
  product: string | IProduct;
  dealPrice: number;
  originalPrice: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart types for Zustand
export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variant: {
    sku: string;
    combination: Record<string, string>;
    price: number;
  };
  quantity: number;
  maxStock: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem, preventOpen?: boolean) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter types
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  attributes?: Record<string, string[]>;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Wishlist store types
export interface WishlistStore {
  items: string[];
  isLoaded: boolean;
  setItems: (items: string[]) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  syncFromServer: () => Promise<void>;
}
