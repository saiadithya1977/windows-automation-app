import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log("✅ DB connected");
  } catch (e) {
    console.error("❌ DB failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
