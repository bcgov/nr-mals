const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchLicenceTypes() {
  const records = await prisma.mal_licence_type_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    licence_type: r.licence_type,
    standard_fee: r.standard_fee,
    licence_term: r.licence_term,
  }));
}

router.get("/", async (req, res, next) => {
  await fetchLicenceTypes()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.licence_type));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
