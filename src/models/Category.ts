import mongoose, { Schema, models, model } from "mongoose";

export interface ICategoryDoc extends mongoose.Document {
  name: string;
  slug: string;
  image?: { url: string; publicId: string };
  icon?: string;
  parent?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  deletedAt?: Date | null;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: {
      url: String,
      publicId: String,
    },
    icon: String,
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CategorySchema.index({ parent: 1, isActive: 1 });

const Category = models.Category || model<ICategoryDoc>("Category", CategorySchema);
export default Category;
