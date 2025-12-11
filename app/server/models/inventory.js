const { formatDate } = require("../utilities/formatting");
const { parseAsInt, parseAsFloat } = require("../utilities/parsing");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

const constants = require("../utilities/constants");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceId: input.licence_id,
    speciesSubCodeId: input.species_sub_code_id,
    date: formatDate(input.recorded_date),
    value: input.recorded_value === 0 ? null : input.recorded_value,
  };

  return output;
}

function convertToPhysicalModel(input, update, licenceTypeId) {
  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    mal_licence_species_sub_code_lu: {
      connect: { id: parseAsInt(input.speciesSubCodeId) },
    },
    recorded_date: input.date,
    recorded_value: input.value === null ? 0 : input.value,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };
  return output;
}

function convertToUpdatePhysicalModel(input, date, licenceTypeId) {
  const output = {
    where: { id: input.id },
    data: convertToPhysicalModel(
      populateAuditColumnsUpdate(input, date),
      true,
      licenceTypeId
    ),
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertToUpdatePhysicalModel,
};
