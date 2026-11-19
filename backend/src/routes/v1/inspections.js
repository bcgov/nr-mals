const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../../utilities/auditing");
const inspection = require("../../models/inspection");
const { withPrisma } = require("../../db/prisma");

const router = express.Router();
const prisma = new PrismaClient();

/*** Apiary Inspections ***/
async function findApiaryInspection(inspectionId) {
  return prisma.mal_apiary_inspection.findUnique({
    where: {
      id: inspectionId,
    },
    include: { mal_apiary_inspection_type_lu: true },
  });
}

async function createApiaryInspection(payload) {
  return prisma.mal_apiary_inspection.create({
    data: payload,
    include: { mal_apiary_inspection_type_lu: true },
  });
}

async function updateApiaryInspection(inspectionId, payload) {
  return prisma.mal_apiary_inspection.update({
    data: payload,
    where: {
      id: inspectionId,
    },
    include: { mal_apiary_inspection_type_lu: true },
  });
}

const LICENCE_INSPECTION_PAGE_SIZE = 20;

router.get("/apiary/types", async (req, res, next) => {
  await withPrisma(async (client) => {
    const records = await client.mal_apiary_inspection_type_lu.findMany({
      where: { active_flag: true },
      orderBy: [{ code_description: "asc" }],
    });
    return res.send(
      records.map((r) => inspection.convertApiaryInspectionTypeToLogicalModel(r))
    );
  }).catch(next);
});

// All apiary inspections across every site on a licence, newest first.
// Also returns the licence's sites so the UI can offer a site picker for new inspections.
router.get("/apiary/licence/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const parsedPage = parseInt(req.query.page, 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const size = LICENCE_INSPECTION_PAGE_SIZE;

  await withPrisma(async (client) => {
    const sites = await client.mal_site.findMany({
      where: { licence_id: licenceId },
      select: { id: true, apiary_site_id: true },
      orderBy: [{ apiary_site_id: "asc" }],
    });
    const siteIds = sites.map((x) => x.id);
    const apiarySiteIdBySiteId = new Map(
      sites.map((x) => [x.id, x.apiary_site_id])
    );

    const where = { site_id: { in: siteIds } };
    const [records, count] = await Promise.all([
      client.mal_apiary_inspection.findMany({
        where,
        include: { mal_apiary_inspection_type_lu: true },
        orderBy: [{ inspection_date: "desc" }, { id: "desc" }],
        skip: (page - 1) * size,
        take: size,
      }),
      client.mal_apiary_inspection.count({ where }),
    ]);

    const results = records.map((r) => ({
      ...inspection.convertApiaryInspectionToLogicalModel(r),
      apiarySiteId: apiarySiteIdBySiteId.get(r.site_id) ?? null,
    }));

    return res.send({
      results,
      page,
      count,
      sites: sites.map((x) => ({ id: x.id, apiarySiteId: x.apiary_site_id })),
    });
  }).catch(next);
});

router.get("/apiary/:inspectionId(\\d+)", async (req, res, next) => {
  const inspectionId = parseInt(req.params.inspectionId, 10);

  await findApiaryInspection(inspectionId)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested inspection could not be found.",
        });
      }

      const payload = inspection.convertApiaryInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/apiary", async (req, res, next) => {
  const now = new Date();

  const payload = inspection.convertApiaryInspectionToPhysicalModel(
    populateAuditColumnsCreate(req.body, now, now)
  );

  await createApiaryInspection(payload)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "Error while creating inspection.",
        });
      }

      const payload = inspection.convertApiaryInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/apiary/:inspectionId(\\d+)", async (req, res, next) => {
  const inspectionId = parseInt(req.params.inspectionId, 10);

  const now = new Date();

  const payload = inspection.convertApiaryInspectionToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now)
  );

  await updateApiaryInspection(inspectionId, payload)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "Error while updating inspection.",
        });
      }

      const payload = inspection.convertApiaryInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

/*** Dairy Trailer Inspections ***/
async function findTrailerInspection(inspectionId) {
  return prisma.mal_dairy_farm_trailer_inspection.findUnique({
    where: {
      id: inspectionId,
    },
  });
}

async function createTrailerInspection(payload) {
  return prisma.mal_dairy_farm_trailer_inspection.create({
    data: payload,
  });
}

async function updateTrailerInspection(inspectionId, payload) {
  return prisma.mal_dairy_farm_trailer_inspection.update({
    data: payload,
    where: {
      id: inspectionId,
    },
  });
}

router.get("/trailer/:inspectionId(\\d+)", async (req, res, next) => {
  const inspectionId = parseInt(req.params.inspectionId, 10);

  await findTrailerInspection(inspectionId)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested trailer inspection could not be found.",
        });
      }

      const payload = inspection.convertTrailerInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/trailer", async (req, res, next) => {
  const now = new Date();

  const payload = inspection.convertTrailerInspectionToPhysicalModel(
    populateAuditColumnsCreate(req.body, now, now)
  );

  await createTrailerInspection(payload)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "Error while creating trailer inspection.",
        });
      }

      const payload = inspection.convertTrailerInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/trailer/:inspectionId(\\d+)", async (req, res, next) => {
  const inspectionId = parseInt(req.params.inspectionId, 10);

  const now = new Date();

  const payload = inspection.convertTrailerInspectionToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now)
  );

  await updateTrailerInspection(inspectionId, payload)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "Error while updating inspection.",
        });
      }

      const payload = inspection.convertTrailerInspectionToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
