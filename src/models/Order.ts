import mongoose, { Schema, models, model } from "mongoose";

export interface IOrderDoc extends mongoose.Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    productName: string;
    productSlug: string;
    productImage: string;
    variant: {
      sku: string;
      combination: Map<string, string>;
      price: number;
    };
    quantity: number;
    subtotal: number;
  }[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: "cod" | "bkash" | "nagad";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingHistory: {
    status: string;
    message: string;
    timestamp: Date;
  }[];
  estimatedDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        productSlug: { type: String, default: "" },
        productImage: { type: String, default: "" },
        variant: {
          sku: { type: String, required: true },
          combination: { type: Map, of: String },
          price: { type: Number, required: true },
        },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
    },
    paymentMethod: { type: String, enum: ["cod", "bkash", "nagad"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        message: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    estimatedDelivery: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = models.Order || model<IOrderDoc>("Order", OrderSchema);
export default Order;
