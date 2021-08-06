const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertApiaryInspectionToLogicalModel(input) {
  const output = {
    id: input.id,
    siteId: input.site_id,
    inspectionDate: formatDate(input.inspection_date),
    inspectorId: input.inspector_id,
    coloniesTested: input.colonies_tested,
    broodTested: input.brood_tested,
    varroaTested: input.varroa_tested,
    smallHiveBeetleTested: input.small_hive_beetle_tested,
    americanFoulbroodResult: input.american_foulbrood_result,
    europeanFoulbroodResult: input.european_foulbrood_result,
    smallHiveBeetleResult: input.small_hive_beetle_result,
    chalkbroodResult: input.chalkbrood_result,
    sacbroodResult: input.sacbrood_result,
    nosemaResult: input.nosema_result,
    varroaMiteResult: input.varroa_mite_result,
    varroaMiteResultPercent: input.varroa_mite_result_percent,
    otherResultDescription: input.other_result_description,
    supersInspected: input.supers_inspected,
    supersDestroyed: input.supers_destroyed,
    inspectionComment: input.inspection_comment,
  };

  return output;
}

function convertApiaryInspectionToPhysicalModel(input) {
  const output = {
    // mal_site: {
    //   connect: { id: input.siteId },
    // },
    site_id: input.siteId,
    inspection_date: input.inspectionDate,
    inspector_id: input.inspectorId,
    colonies_tested: input.coloniesTested,
    brood_tested: input.broodTested,
    varroa_tested: input.varroaTested,
    small_hive_beetle_tested: input.smallHiveBeetleTested,
    american_foulbrood_result: input.americanFoulbroodResult,
    european_foulbrood_result: input.europeanFoulbroodResult,
    small_hive_beetle_result: input.smallHiveBeetleResult,
    chalkbrood_result: input.chalkbroodResult,
    sacbrood_result: input.sacbroodResult,
    nosema_result: input.nosemaResult,
    varroa_mite_result: input.varroaMiteResult,
    varroa_mite_result_percent: input.varroaMiteResultPercent,
    other_result_description: input.otherResultDescription,
    supers_inspected: input.supersInspected,
    supers_destroyed: input.supersDestroyed,
    inspection_comment: input.inspectionComment,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = {
  convertApiaryInspectionToLogicalModel,
  convertApiaryInspectionToPhysicalModel,
};
