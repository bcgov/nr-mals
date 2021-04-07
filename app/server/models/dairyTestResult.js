const { formatDate } = require("../utilities/formatting");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    //mal_dairy_farm_test_job: { connect: { id: input.testJobId } },
    test_job_id: input.testJobId,
    licence_id: input.licenceId,
    irma_number: input.irmaNumber,
    plant_code: input.plantCode,
    test_month: input.testMonth,
    test_year: input.testYear,
    spc1_day: input.scp1Day,
    spc1_date: input.spc1Date,
    spc1_value: input.scp1Value,
    spc1_infraction_flag: input.scp1Infraction,
    spc1_previous_infraction_first_date: input.spc1PreviousInfractionFirstDate,
    spc1_previous_infraction_count: input.spc1PreviousInfractionCount,
    spc1_levy_percentage: input.spc1LevyPercentage,
    spc1_correspondence_code: input.spc1Correspondence,
    spc1_correspondence_description: input.spc1CorrespondenceDescription,
    scc_day: input.sccDay,
    scc_date: input.sccDate,
    scc_value: input.sccValue,
    scc_infraction_flag: input.sccInfrationFlag,
    scc_previous_infraction_first_date: input.sccPreviousInfractionFirstDate,
    scc_previous_infraction_count: input.sccPreviousInfractionCount,
    scc_levy_percentage: input.sccLevyPercentage,
    scc_correspondence_code: input.sccCorrespondenceCode,
    scc_correspondence_description: input.sccCorrespondenceDescription,
    cry_day: input.cryDay,
    cry_date: input.cryDate,
    cry_value: input.cryValue,
    cry_infraction_flag: input.cryInfractionFlag,
    cry_previous_infraction_first_date: input.cryPreviousInfractionFirstDate,
    cry_previous_infraction_count: input.cryPreviousInfractionCount,
    cry_levy_percentage: input.cryLevyPercentage,
    cry_correspondence_code: input.cryCorrespondenceCode,
    cry_correspondence_description: input.cryCorrespondenceDescription,
    ffa_day: input.ffaDay,
    ffa_date: input.ffaDate,
    ffa_value: input.ffaValue,
    ffa_infraction_flag: input.ffaInfractionFlag,
    ffa_previous_infraction_first_date: input.ffaPreviousInfractionFirstDate,
    ffa_previous_infraction_count: input.ffaPreviousInfractionCount,
    ffa_levy_percentage: input.ffaLevyPercentage,
    ffa_correspondence_code: input.ffaCorrespondenceCode,
    ffa_correspondence_description: input.ffaCorrespondenceDescription,
    ih_day: input.ihDay,
    ih_date: input.ihDate,
    ih_value: input.ihvalue,
    ih_infraction_flag: input.ihInfractionFlag,
    ih_previous_infraction_first_date: input.ihPreviousInfractionFirstDate,
    ih_previous_infraction_count: input.ihPreviousInfractionCount,
    ih_levy_percentage: input.ihLevyPercentage,
    ih_correspondence_code: input.ihCorrespondenceCode,
    ih_correspondence_description: input.ihCorrespondenceDescription,
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
