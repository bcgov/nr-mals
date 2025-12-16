const { PrismaClient } = require("@prisma/client");

// helper function to prevent concurrent requests disconnecting from prisma causing others to fail
async function withPrisma(run) {
  const prisma = new PrismaClient();
  try {
    return await run(prisma);
  } finally {
    await prisma.$disconnect().catch((err) => console.error("prisma disconnect failed", err));
  }
}

module.exports = { withPrisma };