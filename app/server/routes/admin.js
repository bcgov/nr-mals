const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

const user = require("../models/user");
const role = require("../models/role");

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

module.exports = router;
