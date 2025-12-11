const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchRegions() {
  const records = await prisma.mal_region_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    region_number: r.region_number,
    region_name: r.region_name,
  }));
}

router.get("/", async (req, res, next) => {
  await fetchRegions()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.region_number));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
