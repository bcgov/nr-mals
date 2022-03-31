const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const { formatDate } = require("../utilities/formatting");

const Util = require("../utilities/util");

const user = require("../models/user");
const role = require("../models/role");
const dairyTestResult = require("../models/dairyTestResult");
const dairyTestThreshold = require("../models/dairyTestThreshold");
const premisesDetail = require("../models/premisesDetail");

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

async function fetchPremisesJobById(jobId) {
  return prisma.mal_premises_job.findFirst({
    where: {
      id: jobId,
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

async function createPremisesIdResults(payloads) {
  for (let i = 0; i < payloads.length; i += 1) {
    const result = await prisma.mal_premises_detail.create({
      data: payloads[i],
    });
  }
}

router.post("/dairytestresults", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  let jobId = null;

  try {
    // Begin job and assign new job id
    const queryJobResult = await prisma.$queryRaw(
      "CALL mals_app.pr_start_dairy_farm_test_job('FILE', NULL)"
    );

    jobId = queryJobResult[0].iop_job_id;

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

    // Create payload and save
    const createPayloads = licenceMatch.map((r) =>
      dairyTestResult.convertToPhysicalModel(
        populateAuditColumnsCreate(r, new Date()),
        false
      )
    );

    Util.Log(`Dairy Data Load: start row create`);
    const result = await createDairyTestResults(createPayloads);
    Util.Log(`Dairy Data Load: row create complete`);

    Util.Log(`Dairy Data Load: CALL pr_update_dairy_farm_test_results`);
    const updateJobQuery = `CALL mals_app.pr_update_dairy_farm_test_results(${jobId}, ${licenceMatch.length}, NULL, NULL)`;
    const queryUpdateResult = await prisma.$queryRaw(updateJobQuery);
    Util.Log(`Dairy Data Load: pr_update_dairy_farm_test_results complete`);

    return res.status(200).send({
      attemptCount: data.length,
      successInsertCount: licenceMatch.length,
      licenceNoIrmaMatch: licenceNoMatch,
    });
  } catch (error) {
    Util.Error(`Dairy Data Load: ${error}`);
    if (jobId !== null) {
      // Delete any rows created in this job
      const deleteResult = await prisma.$queryRaw(
        `DELETE FROM mals_app.mal_dairy_farm_test_result WHERE test_job_id = ${jobId}`
      );
      Util.Log(
        `Dairy Data Load: deleted job id ${jobId} rows in mal_dairy_farm_test_result`
      );
      // Mark job as failed and add comment
      const updateResult = await prisma.$queryRaw(
        `UPDATE mals_app.mal_dairy_farm_test_job SET job_status = 'FAILED', execution_comment = '${error.message}' WHERE id = ${jobId}`
      );
      Util.Log(
        `Dairy Data Load: updated job id ${jobId} to FAILED in mal_dairy_farm_test_job`
      );
    }

    return res.status(500).send({
      code: 500,
      description: `The data load has been cancelled. ${error.message}`,
    });
  } finally {
    async () => prisma.$disconnect();
  }
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

router.post("/premisesidresults", async (req, res, next) => {
  const now = new Date();
  const data = req.body;

  let jobId = null;

  try {
    // Begin job and assign new job id
    const queryJobResult = await prisma.$queryRaw(
      "CALL mals_app.pr_start_premises_job(NULL)"
    );

    jobId = queryJobResult[0].iop_premises_job_id;

    // Create payload and save
    const createPayloads = data.map((r) =>
      premisesDetail.convertToPhysicalModel(
        populateAuditColumnsCreate(
          { ...r, premises_job_id: jobId },
          new Date()
        ),
        false
      )
    );

    Util.Log(`Premises Data Load: start row create`);
    const result = await createPremisesIdResults(createPayloads);
    Util.Log(`Premises Data Load: row create complete`);

    Util.Log(`Premises Data Load: CALL pr_process_premises_import`);
    const updateJobQuery = `CALL mals_app.pr_process_premises_import(${jobId}, NULL, NULL)`;
    const queryUpdateResult = await prisma.$queryRaw(updateJobQuery);
    Util.Log(`Premises Data Load: pr_process_premises_import complete`);

    const premisesJob = await fetchPremisesJobById(jobId);

    return res.status(200).send({
      status: premisesJob.job_status,
      comment: premisesJob.execution_comment,
      attemptCount: premisesJob.source_row_count,
      insertCount: premisesJob.target_insert_count,
      updateCount: premisesJob.target_update_count,
      doNotInsertCount: premisesJob.source_do_not_import_count,
    });
  } catch (error) {
    Util.Error(`Premises Data Load: ${error}`);
    if (jobId !== null) {
      // Delete any rows created in this job
      const deleteResult = await prisma.$queryRaw(
        `DELETE FROM mals_app.mal_premises_detail WHERE premises_job_id = ${jobId}`
      );
      Util.Log(
        `Premises Data Load: deleted job id ${jobId} rows in mal_premises_detail`
      );
      // Mark job as failed and add comment
      const formattedErrorMessage = error.message.replace(/(\n)|(`)|(')/g, "");
      const updateQuery = `UPDATE mals_app.mal_premises_job SET job_status = 'FAILED', execution_comment = '${formattedErrorMessage}' WHERE id = ${jobId}`;
      const updateResult = await prisma.$queryRaw(updateQuery);
      Util.Log(
        `Premises Data Load: updated job id ${jobId} to FAILED in mal_premises_job`
      );
    }

    return res.status(500).send({
      code: 500,
      description: `The data load has been cancelled. ${error.message}`,
    });
  } finally {
    async () => prisma.$disconnect();
  }
});

module.exports = router;
