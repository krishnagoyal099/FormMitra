// prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@bureaucracy.ai";
  const password = "Password123!";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: "user_seed_admin",
      email,
      name: "Admin User",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Seeded admin user: ${user.email} (${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
