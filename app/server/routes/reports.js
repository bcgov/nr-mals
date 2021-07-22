const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const { formatDate } = require("../utilities/formatting");

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

module.exports = router;
