import mongoose, { Schema, models, model } from "mongoose";

export interface ICouponDoc extends mongoose.Document {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minimumPurchaseAmount?: number;
  applicableProducts: mongoose.Types.ObjectId[];
  isActive: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
}

const CouponSchema = new Schema<ICouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed_amount"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 1 },
    minimumPurchaseAmount: { type: Number, default: 0 },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, min: 1 },
    usageLimitPerUser: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon = models.Coupon || model<ICouponDoc>("Coupon", CouponSchema);
export default Coupon;
