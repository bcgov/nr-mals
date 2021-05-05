const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const user = require("../models/user");

// Request will add the current users IDIR from Keycloak in the headers
// Validate IDIR against database and get user role if applicable
// Compare role against allowed roles for the endpoint
// Deny if role requirement is not met

async function fetchUser(username) {
  return prisma.mal_application_user.findFirst({
    where: {
      user_name: username,
    },
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
