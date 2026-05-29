import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../models/User";

dotenv.config({ path: path.join(__dirname, "../../.env") });

type SeedUserRole =
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "borrower";

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: SeedUserRole;
};

const seedUsers: SeedUser[] = [
  {
    name: "Admin User",
    email: "admin@lms.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Sales Executive",
    email: "sales@lms.com",
    password: "Sales@123",
    role: "sales",
  },
  {
    name: "Sanction Executive",
    email: "sanction@lms.com",
    password: "Sanction@123",
    role: "sanction",
  },
  {
    name: "Disburse Executive",
    email: "disburse@lms.com",
    password: "Disburse@123",
    role: "disbursement",
  },
  {
    name: "Collection Executive",
    email: "collect@lms.com",
    password: "Collect@123",
    role: "collection",
  },
  {
    name: "Test Borrower",
    email: "borrower@lms.com",
    password: "Borrower@123",
    role: "borrower",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to MongoDB");

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⏭Skipping ${userData.email} — already exists`);
        continue;
      }
      await User.create(userData);
      console.log(`Created: ${userData.email} (${userData.role})`);
    }

    console.log("\nSeed complete! Login credentials:");
    console.log("─────────────────────────────────────────");
    seedUsers.forEach((u) =>
      console.log(
        `  ${u.role.padEnd(14)} │ ${u.email.padEnd(22)} │ ${u.password}`,
      ),
    );
    console.log("─────────────────────────────────────────");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
