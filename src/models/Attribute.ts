import mongoose, { Schema, models, model } from "mongoose";

export interface IAttributeDoc extends mongoose.Document {
  name: string;
  values: string[];
  type: "select" | "color" | "button";
}

const AttributeSchema = new Schema<IAttributeDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    values: [{ type: String, trim: true }],
    type: { type: String, enum: ["select", "color", "button"], default: "select" },
  },
  { timestamps: true }
);

const Attribute = models.Attribute || model<IAttributeDoc>("Attribute", AttributeSchema);
export default Attribute;
