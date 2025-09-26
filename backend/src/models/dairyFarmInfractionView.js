const { formatDate } = require("../utilities/formatting");

function convertToLogicalModel(input) {
  const output = {
    id:
      input.dairy_farm_test_result_id +
      "_" +
      input.licence_id +
      "_" +
      input.species_sub_code,
    testResultId: input.dairy_farm_test_result_id,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    speciesSubCode: input.species_sub_code,
    recordedDate: formatDate(input.recorded_date),
    correspondenceCode: input.correspondence_code,
    correspondenceDescription: input.correspondence_description,
    levyPercent: input.infraction_json.LevyPercent,
    infractionJson: input.infraction_json,
  };

  return output;
}

module.exports = {
  convertToLogicalModel,
};
