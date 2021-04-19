const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const { formatDate } = require("../utilities/formatting");

const user = require("../models/user");
const role = require("../models/role");
const dairyTestResult = require("../models/dairyTestResult");
const dairyTestThreshold = require("../models/dairyTestThreshold");

const constants = require("../utilities/constants");
const forEach = require("lodash/forEach");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchUsers() {
  return prisma.mal_application_user.findMany({
    orderBy: [
      {
        id: "asc",
      },
    ],
  });
}

async function fetchRoles() {
  return prisma.mal_application_role.findMany({
    orderBy: [
      {
        id: "asc",
      },
    ],
  });
}

async function createUser(payload) {
  return prisma.mal_application_user.create({
    data: payload,
  });
}

async function updateUser(id, payload) {
  return prisma.mal_application_user.update({
    data: payload,
    where: {
      id: id,
    },
  });
}

async function deleteUser(id) {
  return prisma.mal_application_user.delete({
    where: {
      id: id,
    },
  });
}

async function updateDairyResultThreshold(id, payload) {
  return prisma.mal_dairy_farm_test_threshold_lu.update({
    data: payload,
    where: {
      id: id,
    },
  });
}

router.get("/users", async (req, res, next) => {
  const now = new Date();

  await fetchUsers()
    .then((users) => {
      const payload = users.map((x) => user.convertToLogicalModel(x));

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/roles", async (req, res, next) => {
  const now = new Date();

  await fetchRoles()
    .then((roles) => {
      const payload = roles.map((x) => role.convertToLogicalModel(x));

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/user", async (req, res, next) => {
  const now = new Date();

  const createPayload = user.convertToPhysicalModel(
    populateAuditColumnsCreate(req.body, now)
  );

  const current = await fetchUsers();
  const existing =
    current.find((x) => x.user_name === createPayload.user_name) !== undefined;
  if (existing) {
    return res.status(500).send({
      code: 500,
      description: "A user with the given IDIR already exists.",
    });
  }

  await createUser(createPayload)
    .then(async (id) => {
      const users = await fetchUsers();
      const payload = users.map((x) => user.convertToLogicalModel(x));
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/user/:id(\\d+)", async (req, res, next) => {
  const now = new Date();

  const id = parseInt(req.params.id, 10);

  const updatePayload = user.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now)
  );

  const current = await fetchUsers();
  const existing =
    current.find(
      (x) => x.user_name === updatePayload.user_name && x.id !== id
    ) !== undefined;
  if (existing) {
    return res.status(500).send({
      code: 500,
      description: "A user with the given IDIR already exists.",
    });
  }

  await updateUser(id, updatePayload)
    .then(async () => {
      const users = await fetchUsers();
      const payload = users.map((x) => user.convertToLogicalModel(x));
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/user/delete/:id(\\d+)", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  await deleteUser(id)
    .then(async () => {
      const users = await fetchUsers();
      const payload = users.map((x) => user.convertToLogicalModel(x));
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

async function createDairyTestResults(payloads) {
  for (let i = 0; i < payloads.length; i += 1) {
    const result = await prisma.mal_dairy_farm_test_result.create({
      data: payloads[i],
    });
  }
}

router.put("/dairytestresults", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  // Begin job and assign new job id
  const queryJobResult = await prisma.$queryRaw(
    "CALL mals_app.pr_start_dairy_farm_test_job('FILE', NULL)"
  );

  const jobId = queryJobResult[0].iop_job_id;

  const licenceFilterCriteria = {
    irma_number: {
      in: data.map((x) => x.irmaNumber),
    },
  };

  // Assign licence associations
  const licences = await prisma.mal_licence.findMany({
    where: licenceFilterCriteria,
  });

  for (const row of data) {
    row.testJobId = jobId;

    const licence = licences.find((x) => x.irma_number === row.irmaNumber);
    if (licence !== undefined) {
      row.licenceId = licence.id;
    }
  }

  const licenceMatch = data.filter((x) => x.licenceId !== undefined);
  const licenceNoMatch = data.filter((x) => x.licenceId === undefined);

  // =================================================================
  // Begin Warning & Levy notice calculations

  // Get infraction subsets for each type
  const fetchThresholds = await prisma.mal_dairy_farm_test_threshold_lu.findMany();
  const fetchInfractions = await prisma.mal_dairy_farm_test_infraction_lu.findMany();

  const thresholds = [];
  thresholds[constants.DAIRY_TEST_SUBSPECIES.SPC1] = fetchThresholds.find(
    (x) => x.species_sub_code === constants.DAIRY_TEST_SUBSPECIES.SPC1
  );
  thresholds[constants.DAIRY_TEST_SUBSPECIES.SCC] = fetchThresholds.find(
    (x) => x.species_sub_code === constants.DAIRY_TEST_SUBSPECIES.SCC
  );
  thresholds[constants.DAIRY_TEST_SUBSPECIES.CRY] = fetchThresholds.find(
    (x) => x.species_sub_code === constants.DAIRY_TEST_SUBSPECIES.CRY
  );
  thresholds[constants.DAIRY_TEST_SUBSPECIES.FFA] = fetchThresholds.find(
    (x) => x.species_sub_code === constants.DAIRY_TEST_SUBSPECIES.FFA
  );
  thresholds[constants.DAIRY_TEST_SUBSPECIES.IH] = fetchThresholds.find(
    (x) => x.species_sub_code === constants.DAIRY_TEST_SUBSPECIES.IH
  );

  const infractions = [];
  infractions[constants.DAIRY_TEST_SUBSPECIES.SPC1] = fetchInfractions.filter(
    (x) =>
      x.test_threshold_id ===
      thresholds[constants.DAIRY_TEST_SUBSPECIES.SPC1].id
  );
  infractions[constants.DAIRY_TEST_SUBSPECIES.SCC] = fetchInfractions.filter(
    (x) =>
      x.test_threshold_id === thresholds[constants.DAIRY_TEST_SUBSPECIES.SCC].id
  );
  infractions[constants.DAIRY_TEST_SUBSPECIES.CRY] = fetchInfractions.filter(
    (x) =>
      x.test_threshold_id === thresholds[constants.DAIRY_TEST_SUBSPECIES.CRY].id
  );
  infractions[constants.DAIRY_TEST_SUBSPECIES.FFA] = fetchInfractions.filter(
    (x) =>
      x.test_threshold_id === thresholds[constants.DAIRY_TEST_SUBSPECIES.FFA].id
  );
  infractions[constants.DAIRY_TEST_SUBSPECIES.IH] = fetchInfractions.filter(
    (x) =>
      x.test_threshold_id === thresholds[constants.DAIRY_TEST_SUBSPECIES.IH].id
  );

  for (let row of licenceMatch) {
    const fetchResults = await prisma.mal_dairy_farm_test_result.findMany({
      where: {
        licence_id: row.licenceId,
      },
    });

    const previousResults = fetchResults.map((record) =>
      dairyTestResult.convertToLogicalModel(record)
    );

    // Get any data loads from the past 11 months
    let elevenMonths = new Date(
      row.testYear + "-" + row.testMonth + "-" + row.spc1Day
    );
    elevenMonths.setMonth(elevenMonths.getMonth() - 11);
    elevenMonths = formatDate(elevenMonths);

    const filteredResults = previousResults.filter(
      (x) => x.spc1Date >= elevenMonths
    );

    if (
      row.spc1Value >
      thresholds[constants.DAIRY_TEST_SUBSPECIES.SPC1].upper_limit.toFixed(2)
    ) {
      const infractionCount = Math.min(
        filteredResults.filter((x) => x.spc1CorrespondenceDescription !== null)
          .length,
        3
      );

      const infraction = infractions[constants.DAIRY_TEST_SUBSPECIES.SPC1].find(
        (x) => x.previous_infractions_count === infractionCount
      );
      row.spc1PreviousInfractionFirstDate = now;
      row.spc1PreviousInfractionCount = infractionCount;
      row.spc1LevyPercentage = infraction.levy_percentage;
      row.spc1CorrespondenceCode = infraction.correspondence_code;
      row.spc1CorrespondenceDescription = infraction.correspondence_description;
    }

    if (
      row.sccValue >
      thresholds[constants.DAIRY_TEST_SUBSPECIES.SCC].upper_limit.toFixed(2)
    ) {
      const infractionCount = Math.min(
        filteredResults.filter((x) => x.sccCorrespondenceDescription !== null)
          .length,
        3
      );

      const infraction = infractions[constants.DAIRY_TEST_SUBSPECIES.SCC].find(
        (x) => x.previous_infractions_count === infractionCount
      );
      row.sccPreviousInfractionFirstDate = now;
      row.sccPreviousInfractionCount = infractionCount;
      row.sccLevyPercentage = infraction.levy_percentage;
      row.sccCorrespondenceCode = infraction.correspondence_code;
      row.sccCorrespondenceDescription = infraction.correspondence_description;
    }

    if (
      row.cryValue >
      thresholds[constants.DAIRY_TEST_SUBSPECIES.CRY].upper_limit.toFixed(2)
    ) {
      const infractionCount = Math.min(
        filteredResults.filter((x) => x.cryCorrespondenceDescription !== null)
          .length,
        3
      );

      const infraction = infractions[constants.DAIRY_TEST_SUBSPECIES.CRY].find(
        (x) => x.previous_infractions_count === infractionCount
      );
      row.cryPreviousInfractionFirstDate = now;
      row.cryPreviousInfractionCount = infractionCount;
      row.cryLevyPercentage = infraction.levy_percentage;
      row.cryCorrespondenceCode = infraction.correspondence_code;
      row.cryCorrespondenceDescription = infraction.correspondence_description;
    }

    if (
      row.ffaValue >
      thresholds[constants.DAIRY_TEST_SUBSPECIES.FFA].upper_limit.toFixed(2)
    ) {
      const infractionCount = Math.min(
        filteredResults.filter((x) => x.ffaCorrespondenceDescription !== null)
          .length,
        3
      );

      const infraction = infractions[constants.DAIRY_TEST_SUBSPECIES.FFA].find(
        (x) => x.previous_infractions_count === infractionCount
      );
      row.ffaPreviousInfractionFirstDate = now;
      row.ffaPreviousInfractionCount = infractionCount;
      row.ffaLevyPercentage = infraction.levy_percentage;
      row.ffaCorrespondenceCode = infraction.correspondence_code;
      row.ffaCorrespondenceDescription = infraction.correspondence_description;
    }

    if (
      row.ihValue >
      thresholds[constants.DAIRY_TEST_SUBSPECIES.IH].upper_limit.toFixed(2)
    ) {
      const infractionCount = Math.min(
        filteredResults.filter((x) => x.ihCorrespondenceDescription !== null)
          .length,
        3
      );

      const infraction = infractions[constants.DAIRY_TEST_SUBSPECIES.IH].find(
        (x) => x.previous_infractions_count === infractionCount
      );
      row.ihPreviousInfractionFirstDate = now;
      row.ihPreviousInfractionCount = infractionCount;
      row.ihLevyPercentage = infraction.levy_percentage;
      row.ihCorrespondenceCode = infraction.correspondence_code;
      row.ihCorrespondenceDescription = infraction.correspondence_description;
    }
  }

  // End Warning & Levy notice calculations
  // =================================================================

  // Create payload and save
  const createPayloads = licenceMatch.map((r) =>
    dairyTestResult.convertToPhysicalModel(
      populateAuditColumnsCreate(r, new Date()),
      false
    )
  );

  const result = await createDairyTestResults(createPayloads);

  // Complete job
  const updateJobQuery = `CALL mals_app.pr_update_dairy_farm_test_results(${jobId}, ${createPayloads.length}, NULL, NULL)`;
  const queryUpdateResult = await prisma.$queryRaw(updateJobQuery);

  return res.status(200).send({
    attemptCount: data.length,
    successInsertCount: licenceMatch.length,
    licenceNoIrmaMatch: licenceNoMatch,
  });
});

router.put("/dairyfarmtestthresholds/:id(\\d+)", async (req, res, next) => {
  const now = new Date();

  const id = parseInt(req.params.id, 10);

  const updatePayload = dairyTestThreshold.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now),
    true
  );

  await updateDairyResultThreshold(id, updatePayload)
    .then(async () => {
      const fetchThresholds = await prisma.mal_dairy_farm_test_threshold_lu.findMany();
      const payload = fetchThresholds.map((x) =>
        dairyTestThreshold.convertToLogicalModel(x)
      );
      return res.send(collection.sortBy(payload, (r) => r.id));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
