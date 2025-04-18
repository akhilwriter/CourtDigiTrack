import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding the database...");
  
  // Check if admin user already exists
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, 'admin'));
  
  if (existingAdmin.length === 0) {
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin123",
      fullName: "Admin User",
      role: "admin"
    });
    console.log("Admin user created successfully!");
  } else {
    console.log("Admin user already exists, skipping creation");
  }
}

// Run the seed function and handle errors
seed()
  .catch(error => {
    console.error("Error seeding the database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });