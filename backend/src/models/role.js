const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    name: input.role_name,
    description: input.role_description,
    active: input.active_flag,
  };

  return output;
}

function convertToPhysicalModel(input) {
  const output = {
    name: input.name,
    role_description: input.description,
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
