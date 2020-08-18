const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const currentUser = {
    firstName: "Testy",
    lastName: "Testerson",
  };

  const response = {
    currentUser,
    environment: process.env.ENVIRONMENT_LABEL || "dev",
  };

  return res.send(response);
});

module.exports = router;
