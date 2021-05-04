const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const user = require("../models/user");

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

module.exports = function (roles) {
  return async function (req, res, next) {
    try {
      const userName = req.headers.currentuser.substring(
        0,
        req.headers.currentuser.indexOf("@idir")
      );

      const data = await fetchUser(userName.toUpperCase());
      if (data !== undefined) {
        const logical = user.convertToLogicalModel(data);

        if (roles.some((role) => logical.roleId === role)) {
          next();
        } else {
          next("User does not have appropriate permissions.");
        }
      } else {
        next("No valid user found. Cannot validate user role.");
      }
    } catch (err) {
      next(err);
    }
  };
};
