const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertActionRequiredToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    licenceTypeId: input.licence_type_id,
    licenceType: input.licence_type,
    siteRegion: input.site_region,
    licenceStatus: input.licence_status,
    licenceTypeLegislation: input.licence_type_legislation,
    derivedLicenceHolderName: input.derived_licence_holder_name,
    companyName: input.company_name,
    registrantName: input.registrant_name,
    registrantLastName: input.registrant_last_first,
    siteAddress: input.site_address,
    siteCity: input.site_city,
    siteProvince: input.site_province,
    sitePostalCode: input.site_postal_code,
    sitePrimaryPhone: input.site_primary_phone,
    siteSecondaryphone: input.site_secondary_phone,
    siteFaxNumber: input.site_fax_number,
    emailAddress: input.email_address,
  };

  return output;
}

function convertApiaryHiveInspectionToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    licenceStatus: input.licence_status,
    apiarySiteId: input.apiary_site_id,
    regionName: input.region_name,
    lastName: input.last_name,
    firstName: input.first_name,
    inspectionDate: formatDate(input.inspection_date),
    coloniesTested: input.colonies_tested,
    americanFoulbroodResult: input.american_foulbrood_result,
    europeanFoulbroodResult: input.european_foulbrood_result,
    nosemaResult: input.nosema_result,
    chalkbroodResult: input.chalkbrood_result,
    sacbroodResult: input.sacbrood_result,
    varroaTested: input.varroa_tested,
    varroaMiteResult: input.varroa_mite_result,
    varroaMiteResultPercent: input.varroa_mite_result_percent,
    smallHiveBeetleTested: input.small_hive_beetle_tested,
    smallHiveBeetleResult: input.small_hive_beetle_result,
    supersInspected: input.supers_inspected,
    supersDestroyed: input.supers_destroyed,
    hivesPerApiary: input.hives_per_apiary,
    hiveCount: input.hive_count,
  };

  return output;
}

module.exports = {
  convertActionRequiredToLogicalModel,
  convertApiaryHiveInspectionToLogicalModel,
};
