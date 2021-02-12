const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const site = require("../models/site");
const comment = require("../models/comment");
const comments = require("./comments");
const constants = require("../utilities/constants");

const router = express.Router();
const prisma = new PrismaClient();


function getSearchFilter(params) {
  let filter = {};
  const andArray = [];
  if (!Number.isNaN(params.licenceId)) {
    andArray.push({ licence_id: parseInt(params.licenceId) });
  }
  filter = {
    AND: andArray,
  };
  

  return filter;
}

async function countSites(params) {
  const filter = getSearchFilter(params);
  return prisma.mal_site.count({
    where: filter,
  });
}

async function findSites(params, skip, take) {
  const filter = getSearchFilter(params);
  return prisma.mal_site.findMany({
    where: filter,
    include: {
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
    },
    skip,
    take,
  });
}

async function findSite(siteId) {
  return prisma.mal_site.findUnique({
    where: {
      id: siteId,
    },
    include: {
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
    },
  });
}

async function updateSite(siteId, payload) {
  return prisma.mal_site.update({
    data: payload,
    where: {
      id: siteId,
    },
    include: {
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
    },
  });
}

async function createSite(payload) {
  return prisma.mal_site.create({
    data: payload,
  });
}

router.get("/search", async (req, res, next) => {
  let { page } = req.query;
  if (page) {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  const size = 20;
  const skip = (page - 1) * size;

  const params = req.query;

  await findSites(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const results = records.map((record) =>
        site.convertToLogicalModel(record)
      );

      const count = await countSites(params);

      const payload = {
        results,
        page,
        count,
      };

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/:siteId(\\d+)", async (req, res, next) => {
  const siteId = parseInt(req.params.siteId, 10);

  await findSite(siteId)
    .then((record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const payload = site.convertToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/:siteId(\\d+)", async (req, res, next) => {
  const siteId = parseInt(req.params.siteId, 10);

  const now = new Date();

  const sitePayload = site.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now),
    true
  );

  await updateSite(siteId, sitePayload)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const payload = site.convertToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  // Assign the apiary site id if required
  if( data.licenceTypeId ===  constants.LICENCE_TYPE_ID_APIARY ) {
    const sites = await findSites({licenceId:data.licenceId});
    if( sites === null || sites === undefined || sites.length === 0 ) {
      data.apiarySiteId = 100;
    }
    else {
      const high = Math.max.apply(Math, sites.map(function(o) { return o.apiary_site_id; }));
      const next = high+1;
      data.apiarySiteId = next;
    }
  }

  const sitePayload = site.convertToPhysicalModel(
    populateAuditColumnsCreate(data, now, now),
    false
  );

  await createSite(sitePayload)
    .then(async (record) => {
      return res.send({ id: record.id });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
