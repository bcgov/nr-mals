const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { getCurrentUser } = require("../utilities/user");
const licence = require("../models/licence");

const router = express.Router();
const prisma = new PrismaClient();

async function findLicence(licenceId) {
  return prisma.mal_licence.findOne({
    where: {
      id: licenceId,
    },
    include: {
      mal_licence_type_lu: true,
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
    },
  });
}

async function createLicence(payload) {
  return prisma.mal_licence.create({
    data: payload,
  });
}

router.get("/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  await findLicence(licenceId)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const payload = licence.convertToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/", async (req, res, next) => {
  const currentUser = getCurrentUser();
  const now = new Date();

  const payload = licence.convertToPhysicalModel({
    ...req.body,
    createdBy: currentUser.idir,
    createdOn: now,
    updatedBy: currentUser.idir,
    updatedOn: now,
  });

  await createLicence(payload)
    .then((record) => {
      return res.send(record);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
