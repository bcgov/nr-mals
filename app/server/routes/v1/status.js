const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  const response = {
    environment: process.env.ENVIRONMENT_LABEL || "dev",
  };

  return res.send(response);
});

module.exports = router;
