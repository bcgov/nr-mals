const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const { populateAuditColumnsUpdate } = require("../utilities/auditing");

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

async function updateLicenceType(id, payload) {
  return prisma.mal_licence_type_lu.update({
    data: payload,
    where: {
      id: id,
    },
  });
}

router.post("/:id(\\d+)", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  const now = new Date();

  let payload = collection.map(records, (r) => ({
    id: r.id,
    licence_type: r.licence_type,
    standard_fee: r.standard_fee,
    licence_term: r.licence_term,
  }));
  payload = populateAuditColumnsUpdate(payload, now, now);

  await updateLicenceType(id, payload)
    .then(async () => {
      return res.status(200).send(await fetchLicenceTypes());
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/", async (req, res, next) => {
  await fetchLicenceTypes()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.licence_type));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
