const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchCities() {
  const records = await prisma.mal_city_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    cityName: r.city_name,
    cityDescription: r.city_description,
    provinceCode: r.province_code,
    active: r.active_flag,
  }));
}

router.get("/", async (req, res, next) => {
  await fetchCities()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.id));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
