const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

const reports = require("../models/reports");

const constants = require("../utilities/constants");

const prisma = new PrismaClient();
const router = express.Router();

async function getActionRequired(licenceTypeId) {
  return prisma.mal_licence_action_required_vw.findMany({
    where: { licence_type_id: licenceTypeId },
    orderBy: [
      {
        licence_id: "asc",
      },
    ],
  });
}

async function getApiaryHiveInspection(startDate, endDate) {
  const andArray = [];
  andArray.push({ inspection_date: { gte: new Date(startDate) } });
  andArray.push({ inspection_date: { lte: new Date(endDate) } });

  return prisma.mal_apiary_inspection_vw.findMany({
    where: { AND: andArray },
    orderBy: [
      {
        licence_id: "asc",
      },
    ],
  });
}

async function getProducersAnalysisRegion(region, district) {
  return prisma.mal_apiary_producer_vw.findMany({
    where: { site_region_id: region, site_regional_district_id: district },
    orderBy: [
      {
        licence_id: "asc",
      },
      {
        apiary_site_id: "asc",
      },
    ],
  });
}

async function getProducersAnalysisCity(city, minHives, maxHives) {
  const andArray = [];
  andArray.push({ site_city: city });
  andArray.push({ hive_count: { gte: minHives } });
  andArray.push({ hive_count: { lte: maxHives } });

  return prisma.mal_apiary_producer_vw.findMany({
    where: { AND: andArray },
    orderBy: [
      {
        licence_id: "asc",
      },
      {
        apiary_site_id: "asc",
      },
    ],
  });
}

async function getProvincialFarmQuality(startDate, endDate) {
  const spc1Array = [];
  const sccArray = [];
  const cryArray = [];
  const ffaArray = [];
  const ihArray = [];
  spc1Array.push({ spc1_date: { gte: new Date(startDate) } });
  spc1Array.push({ spc1_date: { lte: new Date(endDate) } });

  sccArray.push({ scc_date: { gte: new Date(startDate) } });
  sccArray.push({ scc_date: { lte: new Date(endDate) } });

  cryArray.push({ cry_date: { gte: new Date(startDate) } });
  cryArray.push({ cry_date: { lte: new Date(endDate) } });

  ffaArray.push({ ffa_date: { gte: new Date(startDate) } });
  ffaArray.push({ ffa_date: { lte: new Date(endDate) } });

  ihArray.push({ ih_date: { gte: new Date(startDate) } });
  ihArray.push({ ih_date: { lte: new Date(endDate) } });

  return prisma.mal_dairy_farm_quality_vw.findMany({
    where: {
      OR: [
        { AND: spc1Array },
        { AND: sccArray },
        { AND: cryArray },
        { AND: ffaArray },
        { AND: ihArray },
      ],
    },
    orderBy: [
      {
        licence_id: "asc",
      },
    ],
  });
}

router.get("/actionRequired/:licenceTypeId(\\d+)", async (req, res, next) => {
  const licenceTypeId = parseInt(req.params.licenceTypeId, 10);

  await getActionRequired(licenceTypeId)
    .then((records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested data could not be found.",
        });
      }

      const payload = records.map((record) =>
        reports.convertActionRequiredToLogicalModel(record)
      );
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/apiaryHiveInspection", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await getApiaryHiveInspection(startDate, endDate)
    .then((records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested data could not be found.",
        });
      }

      const payload = records.map((record) =>
        reports.convertApiaryHiveInspectionToLogicalModel(record)
      );
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/producersAnalysisRegion", async (req, res, next) => {
  const region = parseAsInt(req.body.region);
  const district = parseAsInt(req.body.district);

  await getProducersAnalysisRegion(region, district)
    .then((records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested data could not be found.",
        });
      }

      const payload = records.map((record) =>
        reports.convertProducersAnalysisToLogicalModel(record)
      );
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/producersAnalysisCity", async (req, res, next) => {
  const city = req.body.city;
  const minHives = parseAsInt(req.body.minHives);
  const maxHives = parseAsInt(req.body.maxHives);

  await getProducersAnalysisCity(city, minHives, maxHives)
    .then((records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested data could not be found.",
        });
      }

      const payload = records.map((record) =>
        reports.convertProducersAnalysisToLogicalModel(record)
      );
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/provincialFarmQuality", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await getProvincialFarmQuality(startDate, endDate)
    .then((records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested data could not be found.",
        });
      }

      const payload = records.map((record) =>
        reports.convertProvincialFarmQualityToLogicalModel(record)
      );
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
