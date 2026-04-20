import mongoose, { Schema, models, model } from "mongoose";

export interface IReviewDoc extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", trim: true },
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Each user can only review a product once
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = models.Review || model<IReviewDoc>("Review", ReviewSchema);
export default Review;
