const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    surname: input.surname,
    givenName1: input.given_name_1,
    givenName2: input.given_name_2,
    givenName3: input.given_name_3,
    userName: input.user_name,
    roleId: input.application_role_id,
    active: input.active_flag,
  };

  return output;
}

function convertToPhysicalModel(input) {
  const output = {
    surname: input.surname,
    given_name_1: input.givenName1,
    given_name_2: input.givenName2,
    given_name_3: input.givenName3,
    user_name: input.userName.toUpperCase(),
    mal_application_role: { connect: { id: input.roleId } },
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
