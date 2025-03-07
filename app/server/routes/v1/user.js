const express = require("express");
const { PrismaClient } = require("@prisma/client");

const user = require("../../models/user");

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
  const userName = req.body.idir;
  console.log(req.body);

  await fetchUser(userName.toUpperCase())
    .then((data) => {
      if (data === null) {
        return res.status(200).send({
          code: 200,
          description: "The requested IDIR could not be found.",
        });
      }

      console.log("user data");
      console.log(data);
      const logical = user.convertToLogicalModel(data);
      console.log("logical");
      console.log(logical);
      return res.send(logical);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;
