const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const router = express.Router();
const prisma = new PrismaClient();

async function fetchLicenceStatuses() {
  const records = await prisma.mal_status_code_lu.findMany({
    orderBy: [
      {
        code_description: "asc",
      },
    ],
  });
  return collection.map(records, (r) => ({
    id: r.id,
    code_description: r.code_description,
  }));
}

router.get("/", async (req, res, next) => {
  await fetchLicenceStatuses()
    .then((records) => {
      return res.send(records);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
