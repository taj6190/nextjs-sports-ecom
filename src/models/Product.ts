import mongoose, { Schema, models, model } from "mongoose";

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    combination: { type: Map, of: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    images: [ImageSchema],
    isActive: { type: Boolean, default: true },
    weight: { type: Number, default: 0 },
  },
  { _id: true }
);

export interface ISpecificationItem {
  key: string;
  value: string;
}

export interface ISpecificationGroup {
  group: string;
  items: ISpecificationItem[];
}

export interface IProductDoc extends mongoose.Document {
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: mongoose.Types.ObjectId;
  images: { url: string; publicId: string; alt: string }[];
  attributes: {
    attributeId: mongoose.Types.ObjectId;
    name: string;
    values: string[];
  }[];
  variants: mongoose.Types.DocumentArray<{
    sku: string;
    combination: Map<string, string>;
    price: number;
    discountPrice: number;
    stock: number;
    images: { url: string; publicId: string; alt: string }[];
    isActive: boolean;
    weight: number;
  }>;
  specifications: ISpecificationGroup[];
  basePrice: number;
  maxPrice: number;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seo: { title: string; description: string };
  purchaseCount: number;
  avgRating: number;
  reviewCount: number;
  deletedAt?: Date | null;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: "" },
    brand: { type: String, default: "", trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    images: [ImageSchema],
    attributes: [
      {
        attributeId: { type: Schema.Types.ObjectId, ref: "Attribute" },
        name: { type: String, required: true },
        values: [String],
      },
    ],
    variants: [VariantSchema],
    specifications: [
      {
        group: { type: String, required: true },
        items: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],
    basePrice: { type: Number, default: 0, index: true },
    maxPrice: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: [{ type: String, trim: true }],
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    purchaseCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index for filtering
ProductSchema.index({ category: 1, brand: 1, basePrice: 1 });
ProductSchema.index({ name: "text", brand: "text", tags: "text" });
ProductSchema.index({ deletedAt: 1 });

// Pre-save hook to compute basePrice, maxPrice, totalStock
ProductSchema.pre("save", async function () {
  if (this.variants && this.variants.length > 0) {
    const activeVariants = this.variants.filter((v) => v.isActive);
    if (activeVariants.length > 0) {
      this.basePrice = Math.min(...activeVariants.map((v) => v.price));
      this.maxPrice = Math.max(...activeVariants.map((v) => v.price));
      this.totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
    }
  }
});

const Product = models.Product || model<IProductDoc>("Product", ProductSchema);
export default Product;
