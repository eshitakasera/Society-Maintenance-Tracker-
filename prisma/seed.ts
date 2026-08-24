import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
  console.log("Demo Resident:", resident.email);

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
  console.log("Demo Admin:", admin.email);

  console.log("\nSeed complete!");
  console.log("  Resident -> demo.societymaintenance@gmail.com / Demo@1234");
  console.log("  Admin    -> pq@gmail.com / Admin@1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
