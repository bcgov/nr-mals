const { formatDate } = require("../utilities/formatting");
const { parseAsInt, parseAsFloat } = require("../utilities/parsing");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

const constants = require("../utilities/constants");

function convertToLogicalModel(input) {
  let speciesCodeId = null;
  let speciesSubCodeId = null;
  if (input.game_farm_species_code_id !== undefined) {
    speciesCodeId = input.game_farm_species_code_id;
    speciesSubCodeId = input.game_farm_species_sub_code_id;
  }
  if (input.fur_farm_species_code_id !== undefined) {
    speciesCodeId = input.fur_farm_species_code_id;
    speciesSubCodeId = input.fur_farm_species_sub_code_id;
  }

  const output = {
    id: input.id,
    licenceId: input.licence_id,
    speciesCodeId: speciesCodeId,
    speciesSubCodeId: speciesSubCodeId,
    date: formatDate(input.recorded_date),
    value: input.recorded_value,
  };

  return output;
}

function convertToPhysicalModel(input, update, licenceTypeId) {
  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    recorded_date: input.date,
    recorded_value: input.value,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  switch (licenceTypeId) {
    case constants.LICENCE_TYPE_ID_GAME_FARM:
      output.mal_game_farm_species_code_lu = {
        connect: { id: parseAsInt(input.speciesCodeId) },
      };
      output.mal_game_farm_species_sub_code_lu = {
        connect: { id: parseAsInt(input.speciesSubCodeId) },
      };
      break;
    case constants.LICENCE_TYPE_ID_FUR_FARM:
      output.mal_fur_farm_species_code_lu = {
        connect: { id: parseAsInt(input.speciesCodeId) },
      };
      output.mal_fur_farm_species_sub_code_lu = {
        connect: { id: parseAsInt(input.speciesSubCodeId) },
      };
      break;
    default:
      break;
  }

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
