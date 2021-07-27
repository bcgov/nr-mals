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

async function getProducersAnalysis(region, district) {
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

router.post("/producersAnalysis", async (req, res, next) => {
  const region = parseAsInt(req.body.region);
  const district = parseAsInt(req.body.district);

  await getProducersAnalysis(region, district)
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

module.exports = router;
