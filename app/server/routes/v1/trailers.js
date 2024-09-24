const express = require("express");
const { PrismaClient } = require("@prisma/client");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../../utilities/auditing");
const trailer = require("../../models/trailer");
const inspection = require("../../models/inspection");
const constants = require("../../utilities/constants");

const router = express.Router();
const prisma = new PrismaClient();

function getSearchFilter(params) {
  let filter = {};

  const andArray = [];
  const licenceTypeId = parseInt(params.licenceType, 10);
  const licenceNumber = parseInt(params.licenceNumber, 10);

  if (!Number.isNaN(licenceTypeId)) {
    andArray.push({ licence_type_id: licenceTypeId });
  }

  if (!Number.isNaN(licenceNumber)) {
    andArray.push({ licence_number: licenceNumber });
  }

  filter = {
    AND: andArray,
  };

  return filter;
}

async function countTrailers(params) {
  const filter = getSearchFilter(params);
  return prisma.mal_dairy_farm_trailer_vw.count({
    where: filter,
  });
}

async function searchTrailers(params, skip, take) {
  const filter = getSearchFilter(params);
  return prisma.mal_dairy_farm_trailer_vw.findMany({
    where: filter,
    skip,
    take,
  });
}

async function findTrailersByLicenceId(licenceId) {
  return prisma.mal_dairy_farm_trailer.findMany({
    where: {
      licence_id: licenceId,
    },
    include: {
      mal_status_code_lu: true,
      mal_licence: true,
    },
  });
}

async function findTrailer(trailerId) {
  return prisma.mal_dairy_farm_trailer.findUnique({
    where: {
      id: trailerId,
    },
    include: {
      mal_status_code_lu: true,
    },
  });
}

async function updateTrailer(trailerId, payload) {
  return prisma.mal_dairy_farm_trailer.update({
    data: payload,
    where: {
      id: trailerId,
    },
  });
}

async function createTrailer(payload) {
  return prisma.mal_dairy_farm_trailer.create({
    data: payload,
  });
}

// Search for trailers (will always be by licence id)
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

  await searchTrailers(params, skip, size)
    .then(async (records) => {
      if (records === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested trailer could not be found.",
        });
      }

      const results = records.map((record) =>
        trailer.convertSearchResultToLogicalModel(record)
      );

      const count = await countTrailers(params);

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

// Get trailer by id
router.get("/:trailerId(\\d+)", async (req, res, next) => {
  const trailerId = parseInt(req.params.trailerId, 10);

  await findTrailer(trailerId)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested trailer could not be found.",
        });
      }

      const payload = trailer.convertToLogicalModel(record);

      // Grab inspections since they aren't linked by FKs
      if (payload.licenceTrailerSeq !== null) {
        const trailerInspections = await prisma.mal_dairy_farm_trailer_inspection.findMany(
          {
            where: {
              trailer_id: payload.id,
            },
          }
        );

        payload.inspections = trailerInspections.map((xref, index) => ({
          ...inspection.convertTrailerInspectionToLogicalModel(xref),
          key: index,
        }));
      }

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

// Update Trailer
router.put("/:trailerId(\\d+)", async (req, res, next) => {
  const trailerId = parseInt(req.params.trailerId, 10);
  console.log(req.body);
  console.log(req.params);
  const now = new Date();
  const trailerPayload = trailer.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now),
    true
  );

  await updateTrailer(trailerId, trailerPayload)
    .then(async (record) => {
      if (record === null) {
        return res.status(404).send({
          code: 404,
          description: "The requested trailer could not be found.",
        });
      }

      const payload = trailer.convertToLogicalModel(record);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

// Create Trailer
router.post("/", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  if (data.licenceTypeId === constants.LICENCE_TYPE_ID_DAIRY_TANK_TRUCK) {
    const trailers = await findTrailersByLicenceId(data.licenceId);
    if (trailers === null || trailers === undefined || trailers.length === 0) {
      data.licenceTrailerSeq = 100;
    } else {
      const high = Math.max.apply(
        Math,
        trailers.map(function (o) {
          return o.licence_trailer_seq;
        })
      );
      const next = high + 1;
      data.licenceTrailerSeq = next;
    }
  }

  const trailerPayload = trailer.convertToPhysicalModel(
    populateAuditColumnsCreate(data, now, now),
    false
  );

  await createTrailer(trailerPayload)
    .then(async (record) => {
      return res.send({ id: record.id });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
