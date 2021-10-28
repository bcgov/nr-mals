const { formatDate } = require("../utilities/formatting");
const { parseAsFloat, parseAsDate } = require("../utilities/parsing");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    speciesCode: input.species_code,
    speciesSubCode: input.species_sub_code,
    upperLimit: input.upper_limit,
    infractionWindow: input.infraction_window,
    active: input.active_flag,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    species_code: input.speciesCode,
    species_sub_code: input.speciesSubCode,
    upper_limit: input.upperLimit,
    infraction_window: input.infractionWindow,
    active_flag: input.active,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
};
