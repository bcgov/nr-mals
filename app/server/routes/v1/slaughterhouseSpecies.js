const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../../utilities/auditing");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchSpecies() {
  const records = await prisma.mal_sale_yard_species_code_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    licenceTypeId: r.licence_type_id,
    codeName: r.code_name,
    codeDescription: r.code_description,
    active: r.active_flag,
  }));
}

async function fetchSubSpecies() {
  const records = await prisma.mal_sale_yard_species_sub_code_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    speciesCodeId: r.species_code_id,
    codeName: r.code_name,
    codeDescription: r.code_description,
    active: r.active_flag,
  }));
}

async function createSpecies(payload) {
  return prisma.mal_sale_yard_species_code_lu.create({
    data: payload,
  });
}

async function updateSpecies(id, payload) {
  return prisma.mal_sale_yard_species_code_lu.update({
    data: payload,
    where: {
      id: id,
    },
  });
}

router.get("/species", async (req, res, next) => {
  await fetchSpecies()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.id));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/subspecies", async (req, res, next) => {
  await fetchSubSpecies()
    .then((records) => {
      return res.send(collection.sortBy(records, (r) => r.id));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/species", async (req, res, next) => {
  const record = req.body;
  const now = new Date();

  let payload = {
    code_name: record.codeName,
    code_description: record.codeDescription,
    active_flag: true,
  };
  const payloadWithAudit = populateAuditColumnsCreate(payload, now, now);
  payload = {
    ...payload,
    create_userid: payloadWithAudit.createdBy,
    create_timestamp: payloadWithAudit.createdOn,
    update_userid: payloadWithAudit.updatedBy,
    update_timestamp: payloadWithAudit.updatedOn,
  };

  await createSpecies(payload)
    .then(async () => {
      const species = await fetchSpecies();
      const subSpecies = await fetchSubSpecies();
      return res.status(200).send({ species, subSpecies });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/species/:id(\\d+)", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const record = req.body;
  const now = new Date();

  let payload = {
    code_name: record.codeName,
    code_description: record.codeDescription,
  };
  const payloadWithAudit = populateAuditColumnsUpdate(payload, now, now);
  payload = {
    ...payload,
    update_userid: payloadWithAudit.updatedBy,
    update_timestamp: payloadWithAudit.updatedOn,
  };

  await updateSpecies(id, payload)
    .then(async () => {
      const species = await fetchSpecies();
      const subSpecies = await fetchSubSpecies();
      return res.status(200).send({ species, subSpecies });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
