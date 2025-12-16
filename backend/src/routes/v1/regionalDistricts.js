const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchRegionalDistricts() {
  console.log("DEBUG: fetchRegionalDistricts called");
  try {
    console.log("DEBUG: About to query mal_regional_district_lu table");
    const records = await prisma.mal_regional_district_lu.findMany();
    console.log("DEBUG: Query successful, found", records?.length || 0, "records");
    console.log("DEBUG: First record:", records?.[0]);

    const mapped = collection.map(records, (r) => ({
      id: r.id,
      region_id: r.region_id,
      district_number: r.district_number,
      district_name: r.district_name,
    }));
    console.log("DEBUG: Mapped records successfully, returning", mapped.length, "items");
    return mapped;
  } catch (error) {
    console.error("DEBUG: Error in fetchRegionalDistricts:", error);
    throw error;
  }
}

router.get("/", async (req, res, next) => {
  console.log("DEBUG: Regional districts GET endpoint called");
  await fetchRegionalDistricts()
    .then((records) => {
      console.log("DEBUG: About to send", records.length, "sorted records");
      return res.send(collection.sortBy(records, (r) => r.district_number));
    })
    .catch((error) => {
      console.error("DEBUG: Error in regional districts endpoint:", error);
      next(error);
    })
    .finally(async () => {
      console.log("DEBUG: Disconnecting from database");
      await prisma.$disconnect();
    });
});

module.exports = router;
