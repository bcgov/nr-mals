const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const site = require("../models/site");
const comment = require("../models/comment");
const dairyTank = require("../models/dairyTank");
const inspection = require("../models/inspection");
const comments = require("./comments");
const constants = require("../utilities/constants");
const { max } = require("lodash");

const router = express.Router();
const prisma = new PrismaClient();

const DAIRY_TANK_STATUS = {
  NEW: "new",
  EXISTING: "existing",
  DELETED: "deleted",
};

function getSearchFilter(params) {
  let filter = {};
  if (params.keyword) {
    const orArray = [
      {
        registrant_last_name: { contains: params.keyword, mode: "insensitive" },
      },
      {
        apiary_site_id_display: {
          contains: params.keyword,
          mode: "insensitive",
        },
      },
    ];

    const keywordInt = parseInt(params.keyword, 10);
    if (!Number.isNaN(keywordInt)) {
      orArray.push({ licence_number: keywordInt });
    }

    filter = {
      OR: orArray,
    };
  } else {
    const andArray = [];
    const licenceTypeId = parseInt(params.licenceType, 10);
    const licenceNumber = parseInt(params.licenceNumber, 10);

    if (!Number.isNaN(licenceTypeId)) {
      andArray.push({ licence_type_id: licenceTypeId });
    }

    if (params.registrantName) {
      andArray.push({
        registrant_last_name: {
          contains: params.registrantName,
          mode: "insensitive",
        },
      });
    }

    if (!Number.isNaN(licenceNumber)) {
      andArray.push({ licence_number: licenceNumber });
    }

    if (params.siteID) {
      andArray.push({
        apiary_site_id: {
          contains: params.siteID,
          mode: "insensitive",
        },
      });
    }

    if (params.registrantEmail) {
      andArray.push({
        registrant_email_address: {
          contains: params.registrantEmail,
          mode: "insensitive",
        },
      });
    }

    if (params.contactName) {
      andArray.push({
        site_contact_name: {
          contains: params.contactName,
          mode: "insensitive",
        },
      });
    }

    filter = {
      AND: andArray,
    };
  }

  return filter;
}

async function countSites(params) {
  const filter = getSearchFilter(params);
  return prisma.mal_site_detail_vw.count({
    where: filter,
  });
}

async function searchSites(params, skip, take) {
  const filter = getSearchFilter(params);
  return prisma.mal_site_detail_vw.findMany({
    where: filter,
    skip,
    take,
  });
}

async function findSitesByLicenceId(licenceId) {
  return prisma.mal_site.findMany({
    where: {
      licence_id: licenceId,
    },
    include: {
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
      mal_dairy_farm_tank: true,
      mal_licence: true,
    },
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
      mal_dairy_farm_tank: true,
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

async function createDairyTanks(payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      const result = await prisma.mal_dairy_farm_tank.create({
        data: payload,
      });
      return result;
    })
  );
}

async function deleteDairyTanks(dairyTanks) {
  return Promise.all(
    dairyTanks.map(async (r) => {
      const result = await prisma.mal_dairy_farm_tank.delete({
        where: {
          id: r.id,
        },
      });

      return result;
    })
  );
}

async function updateDairyTanks(payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      const result = await prisma.mal_dairy_farm_tank.update(payload);
      return result;
    })
  );
}

async function updateDairyTankRecheckNotice(id, payload) {
  return await prisma.mal_dairy_farm_tank.update({
    where: {
      id: id,
    },
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

  await searchSites(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const results = records.map((record) =>
        site.convertSearchResultToLogicalModel(record)
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

router.post("/search/export", async (req, res, next) => {
  const params = req.body;

  await searchSites(params)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const results = records.map((record) =>
        site.convertSearchResultToLogicalModel(record)
      );

      const formatValue = (value) => {
        if (value) {
          value = value.toString().replace(",", " "); // replace any commas with a space
          return value;
        }
        return "";
      };

      const columnHeaders =
        "Site ID,Registrant Name,Company Name,Licence Number,City,Region,District,Next Inspection Date\n";
      const values = results
        .map((x) => {
          return `${
            x.apiarySiteIdDisplay ? x.apiarySiteIdDisplay : x.siteId
          },${formatValue(x.registrantLastName)},${formatValue(
            x.registrantCompanyName
          )},${formatValue(x.licenceNumber)},${formatValue(
            x.licenceCity
          )},${formatValue(x.licenceRegion)},${formatValue(
            x.licenceDistrict
          )},${formatValue(x.nextInspectionDate)}`;
        })
        .join("\n");
      const payload = columnHeaders.concat(values);

      res
        .set({
          "content-disposition": `attachment; filename=SiteResultsExport.csv`,
          "content-type": "text/csv",
        })
        .send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/:siteId(\\d+)", async (req, res, next) => {
  const siteId = parseInt(req.params.siteId, 10);

  await findSite(siteId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const payload = site.convertToLogicalModel(record);

      // Grab inspections since they aren't linked by FKs
      if (payload.apiarySiteId !== null) {
        const apiaryInspections = await prisma.mal_apiary_inspection.findMany({
          where: {
            site_id: payload.id,
          },
        });

        payload.inspections = apiaryInspections.map((xref, index) => ({
          ...inspection.convertApiaryInspectionToLogicalModel(xref),
          key: index,
        }));
      }

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

router.put("/:siteId(\\d+)/dairytanks", async (req, res, next) => {
  const siteId = parseInt(req.params.siteId, 10);
  const now = new Date();

  const dairyTanks = req.body.map((r) => ({
    ...r,
    id: parseInt(r.id, 10),
  }));

  const dairyTanksToCreate = dairyTanks.filter(
    (r) => r.status === DAIRY_TANK_STATUS.NEW
  );
  const dairyTanksToDelete = dairyTanks.filter(
    (r) => r.status === DAIRY_TANK_STATUS.DELETED
  );
  const dairyTanksToUpdate = dairyTanks.filter(
    (r) => r.status === DAIRY_TANK_STATUS.EXISTING
  );

  await findSite(siteId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested site could not be found.",
        });
      }

      const createDairyTanksPayloads = dairyTanksToCreate.map((r) =>
        dairyTank.convertToPhysicalModel(
          populateAuditColumnsCreate(r, now, now),
          false
        )
      );
      const updateDairyTanksPayloads = dairyTanksToUpdate.map((r) =>
        dairyTank.convertToUpdatePhysicalModel(r, now)
      );

      await createDairyTanks(createDairyTanksPayloads);
      await deleteDairyTanks(dairyTanksToDelete);
      await updateDairyTanks(updateDairyTanksPayloads);

      const updatedRecord = await findSite(siteId);

      const payload = site.convertToLogicalModel(updatedRecord);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/dairytanksrecheck/:id(\\d+)", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const now = new Date();

  await updateDairyTankRecheckNotice(id, {
    print_recheck_notice: req.body.checked,
  })
    .then(async () => {
      return res.status(200).send({});
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  // Assign the apiary site id if required
  if (data.licenceTypeId === constants.LICENCE_TYPE_ID_APIARY) {
    const sites = await findSitesByLicenceId(data.licenceId);
    if (sites === null || sites === undefined || sites.length === 0) {
      data.apiarySiteId = 100;
    } else {
      const high = Math.max.apply(
        Math,
        sites.map(function (o) {
          return o.apiary_site_id;
        })
      );
      const next = high + 1;
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
