const { formatDate } = require("../utilities/formatting");
const { parseAsFloat, parseAsDate } = require("../utilities/parsing");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    testJobId: input.test_job_id,
    licenceId: input.licence_id,
    irmaNumber: input.irma_number,
    plantCode: input.plant_code,
    testMonth: input.test_month,
    testYear: input.test_year,
    spc1Day: input.spc1_day,
    spc1Date: formatDate(input.spc1_date),
    spc1Value: parseAsFloat(input.spc1_value),
    spc1InfractionFlag: input.spc1_infraction_flag,
    spc1PreviousInfractionFirstDate: formatDate(
      input.spc1_previous_infraction_first_date
    ),
    spc1PreviousInfractionCount: input.spc1_previous_infraction_count,
    spc1LevyPercentage: input.spc1_levy_percentage,
    spc1Correspondence: input.spc1_correspondence_code,
    spc1CorrespondenceDescription: input.spc1_correspondence_description,
    sccDay: input.scc_day,
    sccDate: formatDate(input.scc_date),
    sccValue: parseAsFloat(input.scc_value),
    sccInfractionFlag: input.scc_infraction_flag,
    sccPreviousInfractionFirstDate: formatDate(
      input.scc_previous_infraction_first_date
    ),
    sccPreviousInfractionCount: input.scc_previous_infraction_count,
    sccLevyPercentage: input.scc_levy_percentage,
    sccCorrespondenceCode: input.scc_correspondence_code,
    sccCorrespondenceDescription: input.scc_correspondence_description,
    cryDay: input.cry_day,
    cryDate: formatDate(input.cry_date),
    cryValue: parseAsFloat(input.cry_value),
    cryInfractionFlag: input.cry_infraction_flag,
    cryPreviousInfractionFirstDate: formatDate(
      input.cry_previous_infraction_first_date
    ),
    cryPreviousInfractionCount: input.cry_previous_infraction_count,
    cryLevyPercentage: input.cry_levy_percentage,
    cryCorrespondenceCode: input.cry_correspondence_code,
    cryCorrespondenceDescription: input.cry_correspondence_description,
    ffaDay: input.ffa_day,
    ffaDate: formatDate(input.ffa_date),
    ffaValue: parseAsFloat(input.ffa_value),
    ffaInfractionFlag: input.ffa_infraction_flag,
    ffaPreviousInfractionFirstDate: formatDate(
      input.ffa_previous_infraction_first_date
    ),
    ffaPreviousInfractionCount: input.ffa_previous_infraction_count,
    ffaLevyPercentage: input.ffa_levy_percentage,
    ffaCorrespondenceCode: input.ffa_correspondence_code,
    ffaCorrespondenceDescription: input.ffa_correspondence_description,
    ihDay: input.ih_day,
    ihDate: formatDate(input.ih_date),
    ihValue: parseAsFloat(input.ih_value),
    ihInfractionFlag: input.ih_infraction_flag,
    ihPreviousInfractionFirstDate: formatDate(
      input.ih_previous_infraction_first_date
    ),
    ihPreviousInfractionCount: input.ih_previous_infraction_count,
    ihLevyPercentage: input.ih_levy_percentage,
    ihCorrespondenceCode: input.ih_correspondence_code,
    ihCorrespondenceDescription: input.ih_correspondence_description,
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
    spc1_day: input.spc1Day,
    spc1_date: parseAsDate(input.spc1Date),
    spc1_value: input.spc1Value,
    spc1_infraction_flag: input.spc1InfractionFlag,
    spc1_previous_infraction_first_date: parseAsDate(
      input.spc1PreviousInfractionFirstDate
    ),
    spc1_previous_infraction_count: input.spc1PreviousInfractionCount,
    spc1_levy_percentage: input.spc1LevyPercentage,
    spc1_correspondence_code: input.spc1CorrespondenceCode,
    spc1_correspondence_description: input.spc1CorrespondenceDescription,
    scc_day: input.sccDay,
    scc_date: parseAsDate(input.sccDate),
    scc_value: input.sccValue,
    scc_infraction_flag: input.sccInfractionFlag,
    scc_previous_infraction_first_date: parseAsDate(
      input.sccPreviousInfractionFirstDate
    ),
    scc_previous_infraction_count: input.sccPreviousInfractionCount,
    scc_levy_percentage: input.sccLevyPercentage,
    scc_correspondence_code: input.sccCorrespondenceCode,
    scc_correspondence_description: input.sccCorrespondenceDescription,
    cry_day: input.cryDay,
    cry_date: parseAsDate(input.cryDate),
    cry_value: input.cryValue,
    cry_infraction_flag: input.cryInfractionFlag,
    cry_previous_infraction_first_date: parseAsDate(
      input.cryPreviousInfractionFirstDate
    ),
    cry_previous_infraction_count: input.cryPreviousInfractionCount,
    cry_levy_percentage: input.cryLevyPercentage,
    cry_correspondence_code: input.cryCorrespondenceCode,
    cry_correspondence_description: input.cryCorrespondenceDescription,
    ffa_day: input.ffaDay,
    ffa_date: parseAsDate(input.ffaDate),
    ffa_value: input.ffaValue,
    ffa_infraction_flag: input.ffaInfractionFlag,
    ffa_previous_infraction_first_date: parseAsDate(
      input.ffaPreviousInfractionFirstDate
    ),
    ffa_previous_infraction_count: input.ffaPreviousInfractionCount,
    ffa_levy_percentage: input.ffaLevyPercentage,
    ffa_correspondence_code: input.ffaCorrespondenceCode,
    ffa_correspondence_description: input.ffaCorrespondenceDescription,
    ih_day: input.ihDay,
    ih_date: parseAsDate(input.ihDate),
    ih_value: input.ihValue,
    ih_infraction_flag: input.ihInfractionFlag,
    ih_previous_infraction_first_date: parseAsDate(
      input.ihPreviousInfractionFirstDate
    ),
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
