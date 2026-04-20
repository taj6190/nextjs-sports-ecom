import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Direct import since this runs as a script
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/electromart";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: "user" },
      phone: String,
      addresses: Array,
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@electromart.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin user already exists:", adminEmail);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(adminPassword, 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
