const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../../utilities/auditing");

const Util = require("../../utilities/util");

const user = require("../../models/user");
const role = require("../../models/role");
const dairyTestResult = require("../../models/dairyTestResult");
const dairyTestThreshold = require("../../models/dairyTestThreshold");
const premisesDetail = require("../../models/premisesDetail");

const prisma = new PrismaClient();
const router = express.Router();

const axios = require("axios");
const {
  SYSTEM_ROLES,
  SYSTEM_ROLES_ARRAY,
} = require("../../utilities/constants");

async function getToken() {
  const url = process.env.USERS_API_TOKEN_URL;
  const token = `${process.env.USERS_API_CLIENT_ID}:${process.env.USERS_API_CLIENT_SECRET}`;
  const encodedToken = Buffer.from(token).toString("base64");
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + encodedToken,
    },
  };
  const grantTypeParam = new URLSearchParams();
  grantTypeParam.append("grant_type", "client_credentials");
  return axios
    .post(url, grantTypeParam, config)
    .then((response) => {
      return response.data.access_token;
    })
    .catch((error) => {
      console.log(error.response);
    });
}

/**
 *
 * @returns list of users with roles in the MALS app
 */
async function fetchUsers() {
  const bearerToken = await getToken();
  const baseUrl = `${process.env.USERS_API_BASE_URL}/integrations/${process.env.USERS_API_INTEGRATION_ID}/${process.env.USERS_API_CSS_ENVIRONMENT}/roles`;

  const urls = [
    `${baseUrl}/${SYSTEM_ROLES.SYSTEM_ADMIN}/users`,
    `${baseUrl}/${SYSTEM_ROLES.INSPECTOR}/users`,
    `${baseUrl}/${SYSTEM_ROLES.USER}/users`,
    `${baseUrl}/${SYSTEM_ROLES.READ_ONLY}/users`,
  ];

  const roles = [
    SYSTEM_ROLES.SYSTEM_ADMIN,
    SYSTEM_ROLES.INSPECTOR,
    SYSTEM_ROLES.USER,
    SYSTEM_ROLES.READ_ONLY,
  ];

  const userList = [];
  const uniqueUsers = new Set();

  const dbUsers = await prisma.mal_application_user.findMany({
    orderBy: [
      {
        id: "asc",
      },
    ],
  });

  // extract a mapping of the user id from the database and their idir username
  const mappingArray = dbUsers.reduce((map, user) => {
    map[user.user_name] = user.id;
    return map;
  }, {});

  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await axios.get(urls[i], {
        headers: { Authorization: "Bearer " + bearerToken },
      });
      const users = res.data.data;
      users.forEach((user) => {
        if (!uniqueUsers.has(user.email)) {
          uniqueUsers.add(user.email);
          userList.push({
            id: mappingArray[user.attributes.idir_username[0]], // the css user also exists in the database
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            idirUsername: user.attributes.idir_username[0],
            username: user.username,
            displayName: user.attributes.display_name[0],
            role: roles[i],
          });
        }
      });
    } catch (err) {
      console.log(err.response.data);
    }
  }

  return userList;
}

async function fetchRoles() {
  return SYSTEM_ROLES_ARRAY;
  // return prisma.mal_application_role.findMany({
  //   orderBy: [
  //     {
  //       id: "asc",
  //     },
  //   ],
  // });
}

async function createUser(payload) {
  return prisma.mal_application_user.create({
    data: payload,
  });
}

async function updateUser(id, payload) {
  const bearerToken = await getToken();
  const { idirUsername, username, role, previousRole } = payload;
  console.log(payload);

  const config = {
    headers: { Authorization: "Bearer " + bearerToken },
  };

  // skip user api calls if there are no changes to the role
  if (role == previousRole) return;

  // add the new role
  const addRolesUrl = `${process.env.USERS_API_BASE_URL}/integrations/${process.env.USERS_API_INTEGRATION_ID}/${process.env.USERS_API_CSS_ENVIRONMENT}/users/${username}/roles`;
  try {
    await axios.post(
      addRolesUrl,
      [
        {
          name: role,
        },
      ],
      config
    );
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to add ${role} role to user ${idirUsername}`);
  }

  // remove the old role
  const removeRolesUrl = `${process.env.USERS_API_BASE_URL}/integrations/${process.env.USERS_API_INTEGRATION_ID}/${process.env.USERS_API_CSS_ENVIRONMENT}/users/${username}/roles/${previousRole}`;
  try {
    await axios.delete(removeRolesUrl, config);
  } catch (err) {
    throw new Error(
      `Failed to remove ${previousRole} role from user ${idirUsername}`
    );
  }

  const roleId = getRoleIdFromRole(role);

  return prisma.mal_application_user.update({
    data: { application_role_id: roleId },
    where: {
      id: id,
    },
  });
}

async function deleteUser(id, payload) {
  const bearerToken = await getToken();
  const { idirUsername, username, role, previousRole } = payload;

  const config = {
    headers: { Authorization: "Bearer " + bearerToken },
  };
  const removeRolesUrl = `${process.env.USERS_API_BASE_URL}/integrations/${process.env.USERS_API_INTEGRATION_ID}/${process.env.USERS_API_CSS_ENVIRONMENT}/users/${username}/roles/${role}`;
  try {
    await axios.delete(removeRolesUrl, config);
  } catch (err) {
    throw new Error(
      `Failed to remove ${previousRole} role from user ${idirUsername}`
    );
  }

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

// helper function
function getRoleIdFromRole(roleDescription) {
  const role = SYSTEM_ROLES_ARRAY.find(
    (role) => role.description === roleDescription
  );
  return role ? role.id : null;
}

// helper function
function getRoleFromRoleId(roleId) {
  const role = SYSTEM_ROLES_ARRAY.find((role) => role.id === roleId);
  return role ? role.description : null;
}

router.get("/users", async (req, res, next) => {
  const now = new Date();

  await fetchUsers()
    .then((users) => {
      // const payload = users.map((x) => user.convertToLogicalModel(x));
      const payload = users;

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/roles", async (req, res, next) => {
  const now = new Date();

  await fetchRoles()
    .then((roles) => {
      // const payload = roles.map((x) => role.convertToLogicalModel(x));
      const payload = roles;
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

  const updatePayload = populateAuditColumnsUpdate(req.body, now);
  // const updatePayload = user.convertToPhysicalModel(
  //   populateAuditColumnsUpdate(req.body, now)
  // );

  // const current = await fetchUsers();
  // const existing =
  //   current.find(
  //     (x) => x.user_name === updatePayload.user_name && x.id !== id
  //   ) !== undefined;
  // if (existing) {
  //   return res.status(500).send({
  //     code: 500,
  //     description: "A user with the given IDIR already exists.",
  //   });
  // }

  await updateUser(id, updatePayload)
    .then(async () => {
      const users = await fetchUsers();
      // const payload = users.map((x) => user.convertToLogicalModel(x));
      const payload = users;
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/user/delete/:id(\\d+)", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const payload = req.body;

  await deleteUser(id, payload)
    .then(async () => {
      const users = await fetchUsers();
      // const payload = users.map((x) => user.convertToLogicalModel(x));
      const payload = users;
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
    const queryJobResult = await prisma.$queryRawUnsafe(
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
    const queryUpdateResult = await prisma.$queryRawUnsafe(updateJobQuery);
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
      const deleteResult = await prisma.$queryRawUnsafe(
        `DELETE FROM mals_app.mal_dairy_farm_test_result WHERE test_job_id = ${jobId}`
      );
      Util.Log(
        `Dairy Data Load: deleted job id ${jobId} rows in mal_dairy_farm_test_result`
      );
      // Mark job as failed and add comment
      const updateResult = await prisma.$queryRawUnsafe(
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
    const queryJobResult = await prisma.$queryRawUnsafe(
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
    const queryUpdateResult = await prisma.$queryRawUnsafe(updateJobQuery);
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
      const deleteResult = await prisma.$queryRawUnsafe(
        `DELETE FROM mals_app.mal_premises_detail WHERE premises_job_id = ${jobId}`
      );
      Util.Log(
        `Premises Data Load: deleted job id ${jobId} rows in mal_premises_detail`
      );
      // Mark job as failed and add comment
      const formattedErrorMessage = error.message.replace(/(\n)|(`)|(')/g, "");
      const updateQuery = `UPDATE mals_app.mal_premises_job SET job_status = 'FAILED', execution_comment = '${formattedErrorMessage}' WHERE id = ${jobId}`;
      const updateResult = await prisma.$queryRawUnsafe(updateQuery);
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
