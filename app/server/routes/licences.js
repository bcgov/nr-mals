const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { getCurrentUser } = require("../utilities/user");

const router = express.Router();
const prisma = new PrismaClient();

async function createLicence(payload) {
  const record = await prisma.mal_licence.create({
    data: payload,
  });

  return record;
}

router.post("/", async (req, res, next) => {
  const currentUser = getCurrentUser();
  const now = new Date();

  const payload = {
    mal_licence_type_lu: {
      connect: { id: req.body.licenceType },
    },
    mal_region_lu: {
      connect: { id: req.body.region },
    },
    mal_status_code_lu: {
      connect: { id: req.body.licenceStatus },
    },
    mal_regional_district_lu: {
      connect: { id: req.body.regionalDistrict },
    },
    application_date: req.body.applicationDate,
    issue_date: req.body.issuedOnDate,
    expiry_date: req.body.expiryDate,
    fee_collected: req.body.feePaidAmount,
    fee_collected_ind: req.body.paymentReceived,
    action_required: req.body.actionRequired,
    licence_prn_requested: req.body.printLicence,
    renewal_prn_requested: req.body.renewalNotice,
    create_userid: currentUser.idir,
    create_timestamp: now,
    update_userid: currentUser.idir,
    update_timestamp: now,
  };

  await createLicence(payload)
    .then((record) => {
      return res.send(record);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
