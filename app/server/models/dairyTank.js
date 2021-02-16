const { formatDate } = require("../utilities/formatting");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    siteId: input.site_id,
    serialNumber: input.serial_number,
    calibrationDate: formatDate(input.calibration_date),
    issueDate: formatDate(input.issue_date),
    manufacturer: input.company,
    modelNumber: input.model,
    capacity: input.capacity,
    recheckYear: input.recheck_year,
    status: "existing",
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    mal_site: { connect: { id: input.siteId } },
    serial_number: input.serialNumber,
    calibration_date: input.calibrationDate,
    issue_date: input.issueDate,
    company: input.manufacturer,
    model: input.modelNumber,
    capacity: input.capacity,
    recheck_year: null, //input.recheckYear,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

function convertToUpdatePhysicalModel(input, date) {
  const output = {
    where: { id: input.id },
    data: convertToPhysicalModel(populateAuditColumnsUpdate(input, date), true),
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertToUpdatePhysicalModel,
};
