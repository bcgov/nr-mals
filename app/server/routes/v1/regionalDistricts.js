const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchRegionalDistricts() {
  const records = await prisma.mal_regional_district_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    region_id: r.region_id,
    district_number: r.district_number,
    district_name: r.district_name,
  }));
}

router.get("/", async (req, res, next) => {
  await fetchRegionalDistricts()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.district_number));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
