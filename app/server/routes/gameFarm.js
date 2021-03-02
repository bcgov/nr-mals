const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchSpecies() {
  const records = await prisma.mal_game_farm_species_code_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    codeName: r.code_name,
    codeDescription: r.code_description,
    active: r.active_flag,
  }));
}

async function fetchSubSpecies() {
  const records = await prisma.mal_game_farm_species_sub_code_lu.findMany();
  return collection.map(records, (r) => ({
    id: r.id,
    speciesCodeId: r.game_farm_species_code_id,
    codeName: r.code_name,
    codeDescription: r.code_description,
    active: r.active_flag,
  }));
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

module.exports = router;
