import mongoose, { Schema, models, model } from "mongoose";

export interface IBrandDoc extends mongoose.Document {
  name: string;
  slug: string;
  logo?: { url: string; publicId: string };
  description?: string;
  isActive: boolean;
  deletedAt?: Date | null;
}

const BrandSchema = new Schema<IBrandDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: {
      url: String,
      publicId: String,
    },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1, deletedAt: 1 });

const Brand = models.Brand || model<IBrandDoc>("Brand", BrandSchema);
export default Brand;
