const { formatDate } = require("../utilities/formatting");
const { parseAsInt, parseAsDate } = require("../utilities/parsing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceId: input.licence_id,
    reissueDate: input.reissue_date ? formatDate(input.reissue_date) : "",
    licenceNumber: input.licence_number,
    licenceTypeId: input.licence_type_id,
    irmaNumber: input.irma_number,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertSearchResultToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceId: input.licence_id,
    reissueDate: input.reissue_date ? formatDate(input.reissue_date) : "",
    licenceNumber: input.licence_number,
    licenceTypeId: input.licence_type_id,
    irmaNumber: input.irma_number,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    reissue_date: parseAsDate(input.reissueDate),
    licence_number: input.licenceNumber,
    licence_type_id: input.licenceTypeId,
    irma_number: input.irmaNumber,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertSearchResultToLogicalModel,
  convertToLogicalModel,
};