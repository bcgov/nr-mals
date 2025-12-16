const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceId: input.licence_id,
    licenceComment: input.licence_comment,
  };

  return output;
}

function convertToPhysicalModel(input) {
  const output = {
    licence_comment: input.licenceComment,
    mal_licence: {
      connect: { id: input.licenceId },
    },
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
