const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../../utilities/auditing");
const inspection = require("../../models/inspection");

const router = express.Router();
const prisma = new PrismaClient();

/*** Apiary Inspections ***/
async function findApiaryInspection(inspectionId) {
  return prisma.mal_apiary_inspection.findUnique({
    where: {
      id: inspectionId,
    },
  });
}

async function createApiaryInspection(payload) {
  return prisma.mal_apiary_inspection.create({
    data: payload,
  });
}

async function updateApiaryInspection(inspectionId, payload) {
  return prisma.mal_apiary_inspection.update({
    data: payload,
    where: {
      id: inspectionId,
    },
  });
}

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
  return prisma.mal_dairy_trailer_inspection.findUnique({
    where: {
      id: inspectionId,
    },
  });
}

async function createTrailerInspection(payload) {
  return prisma.mal_dairy_trailer_inspection.create({
    data: payload,
  });
}

async function updateTrailerInspection(inspectionId, payload) {
  return prisma.mal_dairy_trailer_inspection.update({
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
