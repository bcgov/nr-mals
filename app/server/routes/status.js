const express = require("express");
const { getCurrentUser } = require("../utilities/user");

const router = express.Router();

router.get("/", (req, res) => {
  const currentUser = getCurrentUser();

  const response = {
    currentUser,
    environment: process.env.ENVIRONMENT_LABEL || "dev",
  };

  return res.send(response);
});

module.exports = router;
