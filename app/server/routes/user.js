const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const user = require("../models/user");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchUser(username) {
  return prisma.mal_application_user.findFirst({
    where: {
      user_name: username,
    },
    orderBy: [
      {
        id: "asc",
      },
    ],
  });
}

router.post("/currentUser", async (req, res, next) => {
  const now = new Date();

  const userName = req.body.idir.substring(0, req.body.idir.indexOf("@idir"));

  await fetchUser(userName.toUpperCase())
    .then((data) => {
      if (data === null) {
        return res.status(200).send({
          code: 200,
          description: "The requested IDIR could not be found.",
        });
      }

      const logical = user.convertToLogicalModel(data);
      return res.send(logical);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
