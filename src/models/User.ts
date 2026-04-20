import mongoose, { Schema, models, model } from "mongoose";

export interface IUserDoc extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  phone?: string;
  wishlist: mongoose.Types.ObjectId[];
  addresses: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }[];
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: { type: String, trim: true },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    addresses: [
      {
        fullName: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const User = models.User || model<IUserDoc>("User", UserSchema);
export default User;
