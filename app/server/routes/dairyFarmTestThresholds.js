const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const dairyTestThreshold = require("../models/dairyTestThreshold");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchDairyFarmTestThresholds() {
  return await prisma.mal_dairy_farm_test_threshold_lu.findMany();
}

router.get("/", async (req, res, next) => {
  await fetchDairyFarmTestThresholds()
    .then((records) => {
      records = records.map((x) => dairyTestThreshold.convertToLogicalModel(x));
      return res.send(collection.sortBy(records, (r) => r.id));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
