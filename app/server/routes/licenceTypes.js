const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const { populateAuditColumnsUpdate } = require("../utilities/auditing");
const { formatDate } = require("../utilities/formatting");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchLicenceTypes() {
  const records = await prisma.mal_licence_type_lu.findMany({
    orderBy: [
      {
        licence_type: "asc",
      },
    ],
  });
  return collection.map(records, (r) => ({
    id: r.id,
    licenceType: r.licence_type,
    standardFee: r.standard_fee,
    licenceTerm: r.licence_term,
    standardIssueDate: formatDate(r.standard_issue_date),
    standardExpiryDate: formatDate(r.standard_expiry_date),
    renewalNotice: r.renewal_notice,
    legislation: r.legislation,
    regulation: r.regulation,
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
  const record = req.body;
  const now = new Date();

  let payload = {
    licence_type: record.licenceType,
    standard_fee: record.standardFee,
    licence_term: record.licenceTerm,
    standard_issue_date: record.standardIssueDate,
    standard_expiry_date: record.standardExpiryDate,
    renewal_notice: record.renewalNotice,
    legislation: record.legislation,
    regulation: record.regulation,
  };
  payloadWithAudit = populateAuditColumnsUpdate(payload, now, now);
  payload = {
    ...payload,
    update_userid: payloadWithAudit.updatedBy,
    update_timestamp: payloadWithAudit.updatedOn,
  };

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
