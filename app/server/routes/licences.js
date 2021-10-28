const express = require("express");
const { PrismaClient } = require("@prisma/client");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const licence = require("../models/licence");
const registrant = require("../models/registrant");
const comment = require("../models/comment");
const inventory = require("../models/inventory");
const comments = require("./comments");
const constants = require("../utilities/constants");
const collection = require("lodash/collection");
const dairyTestResult = require("../models/dairyTestResult");

const { parseAsInt, parseAsFloat } = require("../utilities/parsing");
const { formatDate } = require("../utilities/formatting");

const router = express.Router();
const prisma = new PrismaClient();

const REGISTRANT_STATUS = {
  NEW: "new",
  EXISTING: "existing",
  DELETED: "deleted",
};

async function findLicence(licenceId) {
  return prisma.mal_licence.findUnique({
    where: {
      id: licenceId,
    },
    include: {
      mal_licence_type_lu: true,
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
      mal_licence_registrant_xref: {
        select: {
          mal_registrant: true,
        },
      },
      mal_licence_parent_child_xref_mal_licenceTomal_licence_parent_child_xref_parent_licence_id: {
        select: {
          create_timestamp: true,
          mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id: {
            include: {
              mal_licence_type_lu: true,
              mal_status_code_lu: true,
              mal_licence_registrant_xref: {
                select: {
                  mal_registrant: true,
                },
              },
            },
          },
        },
      },
      mal_game_farm_inventory: true,
      mal_fur_farm_inventory: true,
    },
  });
}

async function findLicenceRegistrantXref(licenceId, registrantId) {
  if (licenceId === undefined || registrantId === undefined) {
    return null;
  }
  return prisma.mal_licence_registrant_xref.findFirst({
    where: {
      licence_id: licenceId,
      registrant_id: registrantId,
    },
  });
}

function getSearchFilter(params) {
  let filter = {};
  if (params.keyword) {
    const orArray = [
      { last_name: { contains: params.keyword, mode: "insensitive" } },
      { company_name: { contains: params.keyword, mode: "insensitive" } },
      { irma_number: params.keyword },
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
    const orArray = [];
    andArray.push({ OR: orArray });

    const licenceTypeId = parseInt(params.licenceType, 10);
    const licenceStatusId = parseInt(params.licenceStatus, 10);
    const regionId = parseInt(params.region, 10);
    const regionalDistrictId = parseInt(params.regionalDistrict, 10);

    if (params.licenceTypeIdArray !== undefined) {
      for (let i = 0; i < params.licenceTypeIdArray.length; ++i) {
        orArray.push({ licence_type_id: params.licenceTypeIdArray[i] });
      }
    }

    if (!Number.isNaN(licenceTypeId)) {
      orArray.push({ licence_type_id: licenceTypeId });
    }

    if (!Number.isNaN(licenceStatusId)) {
      andArray.push({ status_code_id: licenceStatusId });
    }
    if (!Number.isNaN(regionId)) {
      andArray.push({ region_id: regionId });
    }
    if (!Number.isNaN(regionalDistrictId)) {
      andArray.push({ regional_district_id: regionalDistrictId });
    }
    if (params.registrantName) {
      andArray.push({
        last_name: { contains: params.registrantName, mode: "insensitive" },
      });
    }
    if (params.registrantEmail) {
      andArray.push({
        email_address: {
          contains: params.registrantEmail,
          mode: "insensitive",
        },
      });
    }
    if (params.city) {
      andArray.push({ city: { contains: params.city, mode: "insensitive" } });
    }
    if (params.issuedDateFrom) {
      andArray.push({ issue_date: { gte: params.issuedDateFrom } });
    }
    if (params.issuedDateTo) {
      andArray.push({ issue_date: { lte: params.issuedDateTo } });
    }
    if (params.renewalDateFrom) {
      andArray.push({ application_date: { gte: params.renewalDateFrom } });
    }
    if (params.renewalDateTo) {
      andArray.push({ application_date: { lte: params.renewalDateTo } });
    }
    if (params.expiryDateFrom) {
      andArray.push({ expiry_date: { gte: params.expiryDateFrom } });
    }
    if (params.expiryDateTo) {
      andArray.push({ expiry_date: { lte: params.expiryDateTo } });
    }

    filter = {
      AND: andArray,
    };
  }

  return filter;
}

function getInventoryHistorySearchFilter(params) {
  let filter = {};
  const andArray = [];

  const licenceId = parseInt(params.licenceId, 10);
  if (!Number.isNaN(licenceId)) {
    andArray.push({ licence_id: licenceId });
  }

  filter = {
    AND: andArray,
  };

  return filter;
}

function getAssociatedLicencesSearchFilter(params) {
  let filter = {};
  const andArray = [];

  const licenceId = parseInt(params.licenceId, 10);
  if (!Number.isNaN(licenceId)) {
    andArray.push({ parent_licence_id: licenceId });
  }

  filter = {
    AND: andArray,
  };

  return filter;
}

function getDairyTestHistorySearchFilter(params) {
  let filter = {};
  const andArray = [];

  const licenceId = parseInt(params.licenceId, 10);
  if (!Number.isNaN(licenceId)) {
    andArray.push({ licence_id: licenceId });
  }

  filter = {
    AND: andArray,
  };

  return filter;
}

async function countLicences(params) {
  const filter = getSearchFilter(params);
  return prisma.mal_licence_summary_vw.count({
    where: filter,
  });
}

async function countInventoryHistory(params) {
  const filter = getInventoryHistorySearchFilter(params);
  switch (parseInt(params.licenceTypeId)) {
    case constants.LICENCE_TYPE_ID_GAME_FARM: {
      return prisma.mal_game_farm_inventory.count({
        where: filter,
      });
    }
    case constants.LICENCE_TYPE_ID_FUR_FARM: {
      return prisma.mal_fur_farm_inventory.count({
        where: filter,
      });
    }
    default:
      return null;
  }
}

async function countAssociatedLicences(params) {
  const filter = getAssociatedLicencesSearchFilter(params);
  return prisma.mal_licence_parent_child_xref.count({
    where: filter,
  });
}

async function findLicences(params, skip, take) {
  const filter = getSearchFilter(params);
  return prisma.mal_licence_summary_vw.findMany({
    where: filter,
    skip,
    take,
  });
}

async function findInventoryHistory(params, skip, take) {
  const filter = getInventoryHistorySearchFilter(params);
  switch (parseInt(params.licenceTypeId)) {
    case constants.LICENCE_TYPE_ID_GAME_FARM: {
      return prisma.mal_game_farm_inventory.findMany({
        where: filter,
        skip,
        take,
        orderBy: [
          {
            recorded_date: "desc",
          },
        ],
      });
    }
    case constants.LICENCE_TYPE_ID_FUR_FARM: {
      return prisma.mal_fur_farm_inventory.findMany({
        where: filter,
        skip,
        take,
        orderBy: [
          {
            recorded_date: "desc",
          },
        ],
      });
    }
    default:
      return null;
  }
}

async function findAssociatedLicences(params, skip, take) {
  const filter = getAssociatedLicencesSearchFilter(params);

  return prisma.mal_licence_parent_child_xref.findMany({
    where: filter,
    skip,
    take,
    select: {
      create_timestamp: true,
      mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id: {
        include: {
          mal_licence_type_lu: true,
          mal_status_code_lu: true,
          mal_licence_registrant_xref: {
            select: {
              mal_registrant: true,
            },
          },
        },
      },
    },
  });
}

async function updateLicence(licenceId, payload) {
  return prisma.mal_licence.update({
    data: payload,
    where: {
      id: licenceId,
    },
    include: {
      mal_licence_type_lu: true,
      mal_region_lu: true,
      mal_regional_district_lu: true,
      mal_status_code_lu: true,
      mal_licence_registrant_xref: {
        select: {
          mal_registrant: true,
        },
      },
      mal_game_farm_inventory: true,
      mal_fur_farm_inventory: true,
      mal_licence_parent_child_xref_mal_licenceTomal_licence_parent_child_xref_parent_licence_id: {
        select: {
          mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id: {
            include: {
              mal_licence_type_lu: true,
              mal_status_code_lu: true,
              mal_licence_registrant_xref: {
                select: {
                  mal_registrant: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function createLicence(payload) {
  return prisma.mal_licence.create({
    data: payload,
  });
}

async function createRegistrants(payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      const result = await prisma.mal_licence_registrant_xref.create({
        data: payload,
      });
      return result;
    })
  );
}

async function deleteRegistrants(licenceId, registrants) {
  return Promise.all(
    registrants.map(async (r) => {
      const xref = await findLicenceRegistrantXref(licenceId, r.id);
      if (xref === null) {
        return null;
      }

      await prisma.mal_licence_registrant_xref.delete({
        where: {
          id: xref.id,
        },
      });

      const result = await prisma.mal_registrant.delete({
        where: {
          id: r.id,
        },
      });

      return result;
    })
  );
}

async function updateRegistrants(licenceId, payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      const xref = await findLicenceRegistrantXref(licenceId, payload.where.id);
      if (xref === null) {
        return null;
      }

      const result = await prisma.mal_registrant.update(payload);
      return result;
    })
  );
}

async function createInventory(licenceTypeId, payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      switch (licenceTypeId) {
        case constants.LICENCE_TYPE_ID_GAME_FARM: {
          const result = await prisma.mal_game_farm_inventory.create({
            data: payload,
          });
          return result;
        }
        case constants.LICENCE_TYPE_ID_FUR_FARM: {
          const result = await prisma.mal_fur_farm_inventory.create({
            data: payload,
          });
          return result;
        }
        default:
          return null;
      }
    })
  );
}

async function deleteInventory(licenceTypeId, id) {
  switch (licenceTypeId) {
    case constants.LICENCE_TYPE_ID_GAME_FARM: {
      return await prisma.mal_game_farm_inventory.delete({
        where: {
          id: id,
        },
      });
    }
    case constants.LICENCE_TYPE_ID_FUR_FARM: {
      return await prisma.mal_fur_farm_inventory.delete({
        where: {
          id: id,
        },
      });
    }
    default:
      return null;
  }
}

async function createLicenceAssociations(payloads) {
  return Promise.all(
    payloads.map(async (payload) => {
      let result = null;

      // Make sure we don't violate UK
      const count = await prisma.mal_licence_parent_child_xref.count({
        where: {
          parent_licence_id:
            payload
              .mal_licence_mal_licenceTomal_licence_parent_child_xref_parent_licence_id
              .connect.id,
          child_licence_id:
            payload
              .mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id
              .connect.id,
        },
      });

      if (count === 0) {
        result = await prisma.mal_licence_parent_child_xref.create({
          data: payload,
        });
      }
      return result;
    })
  );
}

async function deleteLicenceAssociation(id) {
  return await prisma.mal_licence_parent_child_xref.delete({
    where: {
      id: id,
    },
  });
}

async function fetchLicenceTypeParentChildXref() {
  const records = await prisma.mal_licence_type_parent_child_xref.findMany({
    where: {
      active_flag: true,
    },
  });

  return collection.map(records, (r) => ({
    id: r.id,
    parentLicenceTypeId: r.parent_licence_type_id,
    childLicenceTypeId: r.child_licence_type_id,
    activeFlag: r.active_flag,
  }));
}

async function countDairyTestResultHistory(params) {
  const filter = getDairyTestHistorySearchFilter(params);
  return prisma.mal_dairy_farm_test_result.count({
    where: filter,
  });
}

async function findDairyTestResultHistory(params, skip, take) {
  const filter = getDairyTestHistorySearchFilter(params);
  var result = await prisma.mal_dairy_farm_test_result.findMany({
    where: filter,
    orderBy: [
      {
        spc1_date: "desc",
      },
    ],
  });

  // Sort null dates to the back
  result.sort(function (a, b) {
    return (
      (a.spc1_date === null) - (b.spc1_date === null) ||
      -(a.spc1_date > b.spc1_date) ||
      +(a.spc1_date < b.spc1_date)
    );
  });

  // Return subsection
  return result.slice(skip, skip + take);
}

async function fetchLicenceDairyFarmTestResult(licenceId) {
  return await prisma.mal_dairy_farm_test_result.findMany({
    where: {
      licence_id: licenceId,
    },
  });
}

async function updateLicenceDairyFarmTestResult(dairyTestResultId, payload) {
  const result = await prisma.mal_dairy_farm_test_result.update({
    where: { id: dairyTestResultId },
    data: payload,
  });
  return result;
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

router.put("/:licenceId(\\d+)/associated", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  await findLicence(licenceId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const logicalFind = licence.convertToLogicalModel(record);

      const filteredRequest = req.body.filter(
        (x) =>
          logicalFind.associatedLicences.find(
            (y) => y.id === x.childLicenceId
          ) === undefined
      );

      const createAssociationsPayload = filteredRequest.map((x) =>
        licence.convertToAssociatedLicencePhysicalModel(
          populateAuditColumnsCreate(x, new Date()),
          false
        )
      );

      await createLicenceAssociations(createAssociationsPayload);

      const updatedRecord = await findLicence(licenceId);
      const payload = licence.convertToLogicalModel(updatedRecord);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/:licenceId(\\d+)/associated/delete", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  await findLicence(licenceId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      // Delete associations for both licences
      const associatedLicences = await prisma.mal_licence_parent_child_xref.findMany(
        {
          where: {
            OR: [
              { parent_licence_id: licenceId },
              { parent_licence_id: req.body.childLicenceId },
            ],
          },
        }
      );

      const associated = associatedLicences.filter(
        (x) =>
          (x.parent_licence_id === licenceId &&
            x.child_licence_id === req.body.childLicenceId) ||
          (x.parent_licence_id === req.body.childLicenceId &&
            x.child_licence_id === licenceId)
      );

      for (let i = 0; i < associated.length; ++i) {
        await deleteLicenceAssociation(associated[i].id);
      }

      const updatedRecord = await findLicence(licenceId);
      const payload = licence.convertToLogicalModel(updatedRecord);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

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

  await findLicences(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const results = records.map((record) =>
        licence.convertSearchResultToLogicalModel(record)
      );

      const count = await countLicences(params);

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

router.get("/associatedsearch", async (req, res, next) => {
  let { page } = req.query;
  if (page) {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  const size = 20;
  const skip = (page - 1) * size;

  const params = req.query;

  let parents,
    children,
    searchTypeIds = [];

  // Filter licences based on allowed type
  if (params.parentOrChildLicenceTypeId !== null) {
    const parentChildPairs = await fetchLicenceTypeParentChildXref();

    parents = parentChildPairs.filter(
      (x) =>
        x.parentLicenceTypeId === parseAsInt(params.parentOrChildLicenceTypeId)
    );
    children = parentChildPairs.filter(
      (x) =>
        x.childLicenceTypeId === parseAsInt(params.parentOrChildLicenceTypeId)
    );
    for (let i = 0; i < parents.length; ++i) {
      if (parents[i].activeFlag) {
        searchTypeIds.push(parents[i].childLicenceTypeId);
      }
    }
    for (let i = 0; i < children.length; ++i) {
      if (children[i].activeFlag) {
        searchTypeIds.push(children[i].parentLicenceTypeId);
      }
    }
  }

  params.licenceTypeIdArray = [...searchTypeIds];

  await findLicences(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const results = records.map((record) =>
        licence.convertSearchResultToLogicalModel(record)
      );

      const count = await countLicences(params);

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

router.get("/inventoryhistory", async (req, res, next) => {
  let { page } = req.query;
  if (page) {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  const size = 20;
  const skip = (page - 1) * size;

  const params = req.query;

  await findInventoryHistory(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const licence = await findLicence(parseInt(params.licenceId, 10));

      const results = records.map((record) => {
        return {
          ...inventory.convertToLogicalModel(record),
          speciesCodeId: licence.species_code_id,
        };
      });

      const count = await countInventoryHistory(params);

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

router.get("/associated", async (req, res, next) => {
  let { page } = req.query;
  if (page) {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  const size = 20;
  const skip = (page - 1) * size;

  const params = req.query;

  await findAssociatedLicences(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const results = records.map((record) =>
        licence.convertAssociatdLicenceToLogicalModel({
          associatedOnDate: record.create_timestamp,
          ...record.mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id,
        })
      );

      const count = await countAssociatedLicences(params);

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

router.get("/dairytesthistory", async (req, res, next) => {
  let { page } = req.query;
  if (page) {
    page = parseInt(page, 10);
  } else {
    page = 1;
  }

  const size = 20;
  const skip = (page - 1) * size;

  const params = req.query;

  await findDairyTestResultHistory(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      const results = records.map((record) =>
        dairyTestResult.convertToLogicalModel(record)
      );

      const count = await countDairyTestResultHistory(params);

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

router.get("/dairytestresults/:licenceId(\\d+)", async (req, res, next) => {
  await fetchLicenceDairyFarmTestResult(parseAsInt(req.params.licenceId, 10))
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }
      const results = records.map((record) =>
        dairyTestResult.convertToLogicalModel(record)
      );

      const latestTestJobId = Math.max.apply(
        Math,
        results.map(function (o) {
          return o.testJobId;
        })
      );

      let latestResults = null;

      // -1 is the ID from the MALS1 data load, we dont want to pull the entire set if no other load has occured
      if (latestTestJobId !== -1) {
        latestResults = results.filter((x) => x.testJobId === latestTestJobId);
      }

      return res.send(latestResults);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/dairytestresults/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  const now = new Date();

  req.body.spc1InfractionFlag = req.body.spc1CorrespondenceCode !== undefined;
  req.body.sccInfractionFlag = req.body.sccCorrespondenceCode !== undefined;
  req.body.cryInfractionFlag = req.body.cryCorrespondenceCode !== undefined;
  req.body.ffaInfractionFlag = req.body.ffaCorrespondenceCode !== undefined;
  req.body.ihInfractionFlag = req.body.ihCorrespondenceCode !== undefined;

  const updatePayload = dairyTestResult.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now),
    true
  );

  await updateLicenceDairyFarmTestResult(req.body.id, updatePayload)
    .then(async () => {
      const fetch = await fetchLicenceDairyFarmTestResult(licenceId);

      const results = fetch.map((record) =>
        dairyTestResult.convertToLogicalModel(record)
      );

      const latestTestJobId = Math.max.apply(
        Math,
        results.map(function (o) {
          return o.testJobId;
        })
      );

      const latestResults = results.filter(
        (x) => x.testJobId === latestTestJobId
      );

      return res.send(latestResults);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/dairyactions/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const now = new Date();

  const threshold = await prisma.mal_dairy_farm_test_threshold_lu.findUnique({
    where: { id: req.body.thresholdId },
  });

  if (req.body.value > threshold.upper_limit.toFixed(2)) {
    const infractions = await prisma.mal_dairy_farm_test_infraction_lu.findMany(
      {
        where: { test_threshold_id: req.body.thresholdId },
      }
    );

    const fetchResults = await prisma.mal_dairy_farm_test_result.findMany({
      where: {
        licence_id: licenceId,
      },
    });

    const previousResults = fetchResults.map((record) =>
      dairyTestResult.convertToLogicalModel(record)
    );

    // Get any data loads from the past 11 months
    let elevenMonths = new Date(req.body.date);
    elevenMonths.setMonth(elevenMonths.getMonth() - 11);
    elevenMonths = formatDate(elevenMonths);

    const filteredResults = previousResults.filter(
      (x) => x.spc1Date >= elevenMonths
    );

    let infractionCount = 0;

    if (req.body.thresholdId == constants.DAIRY_TEST_THRESHOLD_IDS.IBC) {
      infractionCount = Math.min(
        filteredResults.filter((x) => x.spc1CorrespondenceDescription !== null)
          .length,
        3
      );
    } else if (req.body.thresholdId == constants.DAIRY_TEST_THRESHOLD_IDS.SCC) {
      infractionCount = Math.min(
        filteredResults.filter((x) => x.sccCorrespondenceDescription !== null)
          .length,
        3
      );
    } else if (req.body.thresholdId == constants.DAIRY_TEST_THRESHOLD_IDS.FFA) {
      infractionCount = Math.min(
        filteredResults.filter((x) => x.ffaCorrespondenceDescription !== null)
          .length,
        3
      );
    } else if (req.body.thresholdId == constants.DAIRY_TEST_THRESHOLD_IDS.CRY) {
      infractionCount = Math.min(
        filteredResults.filter((x) => x.cryCorrespondenceDescription !== null)
          .length,
        3
      );
    } else if (req.body.thresholdId == constants.DAIRY_TEST_THRESHOLD_IDS.IH) {
      infractionCount = Math.min(
        filteredResults.filter((x) => x.ihCorrespondenceDescription !== null)
          .length,
        3
      );
    }

    const infraction = infractions.find(
      (x) => x.previous_infractions_count === infractionCount
    );

    const payload = {
      previousInfractionFirstDate: now,
      previousInfractionCount: infractionCount,
      levyPercentage: infraction.levy_percentage,
      correspondence: infraction.correspondence_code,
      correspondenceDescription: infraction.correspondence_description,
    };

    return res.send(payload);
  }
  return res.send(undefined);
});

router.put("/renew/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const { issueDate, expiryDate } = req.body;

  await findLicence(licenceId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      let update = licence.convertToLogicalModel(record);

      // Update issued and expiry dates
      update.issuedOnDate = issueDate;
      update.expiryDate = expiryDate;
      if (update.bondContinuationExpiryDate !== null) {
        update.bondContinuationExpiryDate = new Date(
          update.bondContinuationExpiryDate
        );
      }

      // Reset some connect variables for the update
      update.licenceType = update.licenceTypeId;
      update.licenceStatus = update.licenceStatusId;
      update.regionalDistrict = update.regionalDistrictId;
      update.region = update.regionId;

      const now = new Date();
      const licencePayload = licence.convertToPhysicalModel(
        populateAuditColumnsUpdate(update, now),
        true
      );

      await updateLicence(licenceId, licencePayload);
      const updatedRecord = await findLicence(licenceId);

      const payload = licence.convertToLogicalModel(updatedRecord);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/checkboxes/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  const now = new Date();

  await findLicence(licenceId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      await prisma.mal_licence.update({
        where: { id: licenceId },
        data: {
          action_required: req.body.actionRequired,
          print_certificate: req.body.printLicence,
          print_renewal: req.body.renewalNotice,
        },
      });

      return res.send(true);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  const now = new Date();

  const licencePayload = licence.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now),
    true
  );

  await updateLicence(licenceId, licencePayload)
    .then(async (record) => {
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

router.put("/:licenceId(\\d+)/registrants", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const now = new Date();

  const registrants = req.body.map((r) => ({
    ...r,
    id: parseInt(r.id, 10),
  }));

  const registrantsToCreate = registrants.filter(
    (r) => r.status === REGISTRANT_STATUS.NEW
  );
  const registrantsToDelete = registrants.filter(
    (r) => r.status === REGISTRANT_STATUS.DELETED
  );
  const registrantsToUpdate = registrants.filter(
    (r) => r.status === REGISTRANT_STATUS.EXISTING
  );

  const createRegistrantPayloads = registrantsToCreate.map((r) =>
    registrant.convertToNewLicenceXrefPhysicalModel(r, licenceId, now)
  );
  const updateRegistrantPayloads = registrantsToUpdate.map((r) =>
    registrant.convertToUpdatePhysicalModel(r, now)
  );

  await findLicence(licenceId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested licence could not be found.",
        });
      }

      await createRegistrants(createRegistrantPayloads);

      return licenceId;
    })
    .then(async (licenceId) => {
      // Current primary registrant could be getting deleted which would break the FK
      // Find the oldest registrant not in the deleted list and update primary registrant
      // FK and company names to that

      const updatedRecord = await findLicence(licenceId);
      let updatedRecordLogical = licence.convertToLogicalModel(updatedRecord);
      let recordRegistrants = updatedRecordLogical.registrants;
      recordRegistrants.sort((a, b) =>
        a.createTimestamp > b.createTimestamp
          ? 1
          : b.createTimestamp > a.createTimestamp
          ? -1
          : 0
      );

      let newPrimaryRegistrant = undefined;
      for (r = 0; r < recordRegistrants.length; ++r) {
        if (
          registrantsToDelete.find((x) => x.id === recordRegistrants[r].id) ===
          undefined
        ) {
          newPrimaryRegistrant = recordRegistrants[r];
          break;
        }
      }

      // Update licence primary registrant id and company name columns
      updatedRecordLogical.primaryRegistrantId = newPrimaryRegistrant.id;

      // Update issued and expiry dates
      updatedRecordLogical.issuedOnDate = new Date(
        updatedRecordLogical.issuedOnDate
      );
      updatedRecordLogical.expiryDate = new Date(
        updatedRecordLogical.expiryDate
      );
      if (updatedRecordLogical.bondContinuationExpiryDate !== null) {
        updatedRecordLogical.bondContinuationExpiryDate = new Date(
          updatedRecordLogical.bondContinuationExpiryDate
        );
      }

      // Reset some connect variables for the update
      updatedRecordLogical.licenceType = updatedRecordLogical.licenceTypeId;
      updatedRecordLogical.licenceStatus = updatedRecordLogical.licenceStatusId;
      updatedRecordLogical.regionalDistrict =
        updatedRecordLogical.regionalDistrictId;
      updatedRecordLogical.region = updatedRecordLogical.regionId;

      const fromBodyPrimaryRegistrant = registrants.find(
        (x) =>
          x.firstName === newPrimaryRegistrant.firstName &&
          x.lastName === newPrimaryRegistrant.lastName
      );
      updatedRecordLogical.companyName =
        fromBodyPrimaryRegistrant !== undefined
          ? fromBodyPrimaryRegistrant.companyName
          : undefined;
      updatedRecordLogical.companyNameOverride =
        fromBodyPrimaryRegistrant !== undefined
          ? fromBodyPrimaryRegistrant.companyNameOverride
          : false;

      const updatedLicencePayload = licence.convertToPhysicalModel(
        populateAuditColumnsUpdate(updatedRecordLogical, now, now),
        true
      );
      await updateLicence(licenceId, updatedLicencePayload);

      return licenceId;
    })
    .then(async (licenceId) => {
      // Complete registrant updates
      await deleteRegistrants(licenceId, registrantsToDelete);
      await updateRegistrants(licenceId, updateRegistrantPayloads);

      const updatedRecord = await findLicence(licenceId);

      const payload = licence.convertToLogicalModel(updatedRecord);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/:licenceId(\\d+)/inventory", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const now = new Date();

  let record = await findLicence(licenceId);
  record = licence.convertToLogicalModel(record);

  const inventoryData = req.body.inventory.map((r) => ({
    ...r,
    id: parseInt(r.id, 10),
    licenceId: licenceId,
  }));
  const totalValue = req.body.totalValue;

  const inventoryToCreate = inventoryData.filter((r) => r.id === -1);

  const createInventoryPayload = inventoryToCreate.map((r) =>
    inventory.convertToPhysicalModel(
      populateAuditColumnsCreate(r, now),
      false,
      record.licenceTypeId
    )
  );

  await createInventory(record.licenceTypeId, createInventoryPayload);

  const updatedRecord = await findLicence(licenceId);

  const payload = licence.convertToLogicalModel(updatedRecord);
  return res.send(payload);
});

router.put(
  "/:licenceId(\\d+)/inventory/delete/:inventoryId(\\d+)",
  async (req, res, next) => {
    const licenceId = parseInt(req.params.licenceId, 10);
    const inventoryId = parseInt(req.params.inventoryId, 10);

    let record = await findLicence(licenceId);
    record = licence.convertToLogicalModel(record);

    await deleteInventory(record.licenceTypeId, inventoryId);

    const updatedRecord = await findLicence(licenceId);

    const payload = licence.convertToLogicalModel(updatedRecord);
    return res.send(payload);
  }
);

router.post("/", async (req, res, next) => {
  const now = new Date();

  const newRegistrants = req.body.registrants
    ? req.body.registrants.filter(
        (r) => r && r.status === REGISTRANT_STATUS.NEW
      )
    : [];

  req.body.companyName =
    newRegistrants[0] !== undefined ? newRegistrants[0].companyName : undefined;

  const licencePayload = licence.convertToPhysicalModel(
    populateAuditColumnsCreate(req.body, now, now),
    false
  );

  const { commentText } = req.body;

  await createLicence(licencePayload)
    .then(async (record) => {
      const licenceId = record.id;

      const newRegistrantPayloads = newRegistrants.map((r) =>
        registrant.convertToNewLicenceXrefPhysicalModel(r, licenceId, now)
      );
      await createRegistrants(newRegistrantPayloads);

      if (commentText !== undefined && commentText.length > 0) {
        const commentPayload = comment.convertToPhysicalModel(
          populateAuditColumnsCreate(
            { licenceId, licenceComment: commentText },
            now,
            now
          )
        );
        await comments.createComment(commentPayload);
      }

      return licenceId;
    })
    .then(async (licenceId) => {
      // Update the primary registrant id
      const updatedRecord = await findLicence(licenceId);
      const updatedRecordLogical = licence.convertToLogicalModel(updatedRecord);
      let registrants = updatedRecordLogical.registrants;
      registrants.sort((a, b) =>
        a.createTimestamp > b.createTimestamp
          ? 1
          : b.createTimestamp > a.createTimestamp
          ? -1
          : 0
      );
      updatedRecordLogical.primaryRegistrantId = registrants[0].id;

      // Convert dates from string to date objects
      updatedRecordLogical.issuedOnDate = new Date(
        updatedRecordLogical.issuedOnDate
      );
      updatedRecordLogical.expiryDate = new Date(
        updatedRecordLogical.expiryDate
      );
      if (updatedRecordLogical.bondContinuationExpiryDate !== null) {
        updatedRecordLogical.bondContinuationExpiryDate = new Date(
          updatedRecordLogical.bondContinuationExpiryDate
        );
      }

      // Reset some connect variables for the update
      updatedRecordLogical.licenceType = updatedRecordLogical.licenceTypeId;
      updatedRecordLogical.licenceStatus = updatedRecordLogical.licenceStatusId;
      updatedRecordLogical.regionalDistrict =
        updatedRecordLogical.regionalDistrictId;
      updatedRecordLogical.region = updatedRecordLogical.regionId;

      // Send new primary registrant id
      const updatedLicencePayload = licence.convertToPhysicalModel(
        populateAuditColumnsUpdate(updatedRecordLogical, now, now),
        true
      );
      await updateLicence(licenceId, updatedLicencePayload);

      return licenceId;
    })
    .then((licenceId) => {
      return res.send({ id: licenceId });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
