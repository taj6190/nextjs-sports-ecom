import mongoose, { Schema, models, model } from "mongoose";

export interface ITodaysDealDoc extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  dealPrice: number;
  originalPrice: number;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}

const TodaysDealSchema = new Schema<ITodaysDealDoc>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    dealPrice: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TodaysDealSchema.index({ endTime: 1, isActive: 1 });
TodaysDealSchema.index({ product: 1 });

const TodaysDeal = models.TodaysDeal || model<ITodaysDealDoc>("TodaysDeal", TodaysDealSchema);
export default TodaysDeal;
