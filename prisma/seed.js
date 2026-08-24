// prisma/seed.js — Plain JavaScript seed (works on Render without ts-node)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Demo Resident
  const residentHash = await bcrypt.hash("Demo@1234", 10);
  const resident = await prisma.user.upsert({
    where: { email: "demo.societymaintenance@gmail.com" },
    update: { password: residentHash, name: "Demo Resident" },
    create: {
      name: "Demo Resident",
      email: "demo.societymaintenance@gmail.com",
      password: residentHash,
      role: "RESIDENT",
    },
  });
  console.log("✅ Demo Resident:", resident.email);

  // Demo Admin
  const adminHash = await bcrypt.hash("Admin@1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "pq@gmail.com" },
    update: { password: adminHash, name: "Demo Admin" },
    create: {
      name: "Demo Admin",
      email: "pq@gmail.com",
      password: adminHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Demo Admin:", admin.email);

  console.log("\n🌱 Seed complete!");
  console.log("   Resident → demo.societymaintenance@gmail.com / Demo@1234");
  console.log("   Admin    → pq@gmail.com / Admin@1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });
